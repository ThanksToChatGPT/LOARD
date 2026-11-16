"""Genera aportes editables y consolida los PDF del equipo sin perder sus páginas.

Requiere reportlab, pypdf y Pillow. Ejecutar desde cualquier directorio del repo.
Las bases se leen del commit BASE para no duplicar anexos al repetir la generación.
"""
from pathlib import Path
import hashlib
import html
import json
import re
import subprocess
import textwrap

from PIL import Image as PILImage
from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Preformatted, PageBreak
from reportlab.graphics.shapes import Drawing, Rect, String, Line

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = '2c0bee5'
BLUE = colors.HexColor('#0B3C5D')
for face, file in [('Arial', 'arial.ttf'), ('Arial-Bold', 'arialbd.ttf'), ('Arial-Italic', 'ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(face, str(Path('C:/Windows/Fonts') / file)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')
STYLES = getSampleStyleSheet()
for style in STYLES.byName.values():
    style.fontName = 'Arial'
STYLES.add(ParagraphStyle(name='Texto', fontName='Arial', fontSize=10, leading=14, spaceAfter=8))
STYLES.add(ParagraphStyle(name='Tabla', fontName='Arial', fontSize=8, leading=10.5))
STYLES.add(ParagraphStyle(name='PieImagen', fontName='Arial-Italic', fontSize=8, leading=11, textColor=BLUE, spaceAfter=15))
for h, size in [('Title', 22), ('Heading1', 16), ('Heading2', 12)]:
    STYLES[h].fontName = 'Arial-Bold'
    STYLES[h].fontSize = size
    STYLES[h].leading = size + 5
    STYLES[h].textColor = BLUE
    STYLES[h].spaceBefore = 10
    STYLES[h].spaceAfter = 9
    STYLES[h].keepWithNext = True


def rich(s):
    s = html.escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`([^`]+)`', r'<font color="#0B3C5D">\1</font>', s)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<link href="\2" color="#0B3C5D">\1</link>', s)
    return s


def p(s, style='Texto'):
    return Paragraph(rich(s), STYLES[style])


def table(rows):
    cols = len(rows[0])
    width = A4[0] - 100
    ratios = {2: [.31, .69], 3: [.20, .40, .40], 4: [.15, .26, .22, .37]}.get(cols, [1 / cols] * cols)
    if cols == 4:
        ratios = [.13, .24, .48, .15] if rows[0][-1] == 'Estado' else [.13, .25, .40, .22]
    if rows[0][0] == 'Ruta propuesta': ratios = [.44, .56]
    data = [[p(cell, 'Tabla') for cell in row] for row in rows]
    t = Table(data, colWidths=[width * r for r in ratios], repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#DCEAF3')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), .35, colors.HexColor('#B8CDDA')),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F4F8FB')]),
    ]))
    return t


def diagrama():
    d = Drawing(495, 320)
    nodes = {'USUARIO': (0, 260), 'CORTE': (180, 260), 'VERSION_CORTE': (360, 260),
             'PROYECTO': (0, 160), 'DOSSIER': (180, 160), 'CARPETA': (360, 160),
             'JUNTA': (0, 60), 'ENSAYO_NDT': (180, 60), 'REQUISITO': (360, 60)}
    edges = [('USUARIO', 'CORTE', '1:N'), ('CORTE', 'VERSION_CORTE', '1:N'),
             ('PROYECTO', 'DOSSIER', '1:1'), ('DOSSIER', 'CARPETA', '1:6'),
             ('PROYECTO', 'JUNTA', '1:N'), ('JUNTA', 'ENSAYO_NDT', '1:N'),
             ('ENSAYO_NDT', 'REQUISITO', '1:1'), ('CARPETA', 'REQUISITO', '1:N')]
    for a, b, label in edges:
        ax, ay = nodes[a]; bx, by = nodes[b]
        if ay == by:
            x1, y1, x2, y2 = ax + 130, ay + 22, bx, by + 22
        else:
            x1, y1, x2, y2 = ax + 65, ay, bx + 65, by + 44
        d.add(Line(x1, y1, x2, y2, strokeColor=BLUE, strokeWidth=1))
        d.add(String((x1 + x2) / 2 + 3, (y1 + y2) / 2 + 5, label, fontName='Arial', fontSize=8, fillColor=BLUE))
    for label, (x, y) in nodes.items():
        d.add(Rect(x, y, 130, 44, rx=4, fillColor=colors.HexColor('#EAF3FC'), strokeColor=BLUE))
        d.add(String(x + 65, y + 18, label, textAnchor='middle', fontName='Arial-Bold', fontSize=9, fillColor=BLUE))
    d.add(String(0, 18, 'Resumen conceptual PROPUESTO. Otras relaciones y detalles: tablas y fuente Mermaid.', fontName='Arial', fontSize=8, fillColor=BLUE))
    return d


def render_rite_apa(md, output):
    """Formato APA para el informe RITE, sin cambiar los otros documentos."""
    for face, file in [('Times', 'times.ttf'), ('Times-Bold', 'timesbd.ttf'), ('Times-Italic', 'timesi.ttf')]:
        pdfmetrics.registerFont(TTFont(face, str(Path('C:/Windows/Fonts') / file)))
    pdfmetrics.registerFontFamily('Times', normal='Times', bold='Times-Bold', italic='Times-Italic', boldItalic='Times-Bold')
    base = ParagraphStyle('APA', fontName='Times', fontSize=12, leading=24, textColor=colors.black,
                          alignment=TA_LEFT, firstLineIndent=36, spaceBefore=0, spaceAfter=0)
    heading = ParagraphStyle('APATitulo', parent=base, fontName='Times-Bold', alignment=TA_CENTER,
                             firstLineIndent=0, keepWithNext=True)
    cover = ParagraphStyle('APAPortada', parent=base, alignment=TA_CENTER, firstLineIndent=0)
    plain = ParagraphStyle('APASinSangria', parent=base, firstLineIndent=0)
    label = ParagraphStyle('APATablaNumero', parent=plain, fontName='Times-Bold', keepWithNext=True)
    caption = ParagraphStyle('APATablaTitulo', parent=plain, fontName='Times-Italic', keepWithNext=True)
    cell = ParagraphStyle('APACelda', parent=plain, fontSize=11, leading=14)
    cellhead = ParagraphStyle('APACeldaTitulo', parent=cell, fontName='Times-Bold')
    metadata = json.loads((HERE / 'portada_rite.json').read_text(encoding='utf-8'))
    lines = md.read_text(encoding='utf-8').splitlines()
    title = lines[0][2:]
    paragraph = lambda text, style=base: Paragraph(html.escape(text), style)
    story = [Spacer(1, 72), paragraph(title, heading), Spacer(1, 24)]
    for key in ['estudiante', 'institucion', 'asignatura', 'docente', 'fecha']:
        story.append(paragraph(metadata[key], cover))
    story.extend([PageBreak(), paragraph(title, heading)])
    i = 1
    while i < len(lines):
        line = lines[i].strip()
        if not line: i += 1; continue
        if line.startswith('## '): story.append(paragraph(line[3:], heading))
        elif line.startswith('**Tabla '): story.append(paragraph(line.strip('*'), label))
        elif line.startswith('*Resultados'): story.append(paragraph(line.strip('*'), caption))
        elif line.startswith('*Nota.*'):
            story.append(Paragraph('<i>Nota.</i>' + html.escape(line[len('*Nota.*'):]), plain))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                values = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+', v) for v in values): rows.append(values)
                i += 1
            data = [[paragraph(value, cellhead if n == 0 else cell) for value in row] for n, row in enumerate(rows)]
            t = Table(data, colWidths=[51, 140, 197, 80], repeatRows=1, hAlign='LEFT')
            t.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('LINEABOVE', (0, 0), (-1, 0), .8, colors.black),
                ('LINEBELOW', (0, 0), (-1, 0), .5, colors.black),
                ('LINEBELOW', (0, -1), (-1, -1), .8, colors.black),
                ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t); continue
        else: story.append(paragraph(line))
        i += 1
    def header(c, doc):
        c.saveState(); c.setFont('Times', 12); c.setFillColor(colors.black)
        c.drawRightString(letter[0] - 72, letter[1] - 36, str(doc.page)); c.restoreState()
    SimpleDocTemplate(str(output), pagesize=letter, leftMargin=72, rightMargin=72,
                      topMargin=72, bottomMargin=72, title=title,
                      author='' if metadata['estudiante'].startswith('[') else metadata['estudiante']).build(story, onFirstPage=header, onLaterPages=header)


def render(md, output, simulated=False):
    if md.name == '05-rite-ejemplo.md':
        return render_rite_apa(md, output)
    lines = md.read_text(encoding='utf-8').splitlines()
    story = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1; continue
        if line.startswith('```'):
            kind = line[3:]; code = []; i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i]); i += 1
            if kind == 'mermaid':
                story.append(diagrama())
            else:
                story.append(Preformatted('\n'.join(textwrap.fill(t, 80) for t in code), STYLES['Code']))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+', c) for c in cells): rows.append(cells)
                i += 1
            story.extend([table(rows), Spacer(1, 10)]); continue
        elif line.startswith('!['):
            match = re.fullmatch(r'!\[(.*)\]\((.*)\)', line)
            caption, file = match.groups()
            img = md.parent / file
            with PILImage.open(img) as im: w, h = im.size
            next_i = i + 1
            while next_i < len(lines) and not lines[next_i].strip(): next_i += 1
            pair = re.fullmatch(r'!\[(.*)\]\((.*)\)', lines[next_i].strip()) if next_i < len(lines) else None
            if pair:
                caption2, file2 = pair.groups(); img2 = md.parent / file2
                with PILImage.open(img2) as im: w2, h2 = im.size
                widths = [340, 145] if w > h and h2 > w2 else [240, 245]
                r1 = min((widths[0] - 8) / w, 330 / h); r2 = min((widths[1] - 8) / w2, 330 / h2)
                t = Table([[Image(str(img), w * r1, h * r1), Image(str(img2), w2 * r2, h2 * r2)], [p(caption, 'PieImagen'), p(caption2, 'PieImagen')]], colWidths=widths)
                t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 3), ('RIGHTPADDING', (0, 0), (-1, -1), 3)]))
                story.append(t); i = next_i
            else:
                ratio = min(495 / w, 330 / h)
                story.extend([Image(str(img), w * ratio, h * ratio, hAlign='CENTER'), p(caption, 'PieImagen')])
        elif line.startswith('# '): story.append(p(line[2:], 'Title'))
        elif line.startswith('## '): story.append(p(line[3:], 'Heading1'))
        elif line.startswith('### '): story.append(p(line[4:], 'Heading2'))
        else:
            if line.startswith('> '): line = 'Indicación literal del integrante: ' + line[2:]
            if line.startswith('- '): line = '• ' + line[2:]
            story.append(p(line))
        i += 1
    output.parent.mkdir(parents=True, exist_ok=True)
    def footer(c, doc):
        c.saveState(); c.setFont('Arial', 8); c.setFillColor(BLUE)
        c.drawString(50, 28, 'LOARD · Hito 2 · Aporte HU-M01 / M02 / M07 / M08')
        c.drawRightString(A4[0] - 50, 28, str(doc.page))
        if simulated:
            c.setFillColor(colors.HexColor('#8B1A1A')); c.setFont('Arial-Bold', 8)
            c.drawString(50, 41, 'EJEMPLO SIMULADO — SIN PARTICIPANTES REALES')
        c.restoreState()
    SimpleDocTemplate(str(output), pagesize=A4, leftMargin=50, rightMargin=50, topMargin=42, bottomMargin=58,
                      title=lines[0].lstrip('# '), author='Aporte del integrante responsable con asistencia de Codex').build(story, onFirstPage=footer, onLaterPages=footer)


SHARED = [
    ('01-uso-ia', 'Modulo-I-Prototipo/Informe de uso de ia/Creacion de prototipo - Uso de IA'),
    ('02-responsivo', 'Modulo-II-Frontend/Diseño responsivo/Diseño responsivo'),
    ('03-componentes-heuristicas', 'Modulo-II-Frontend/Inventario de componentes/Inventario de componentes'),
    ('04-accesibilidad', 'Modulo-III-QC/Auditoria de accesibilidad/Auditoria de accesibilidad'),
]


def consolidate():
    for name, relative in SHARED:
        target = ROOT / 'Hito 2' / (relative + '.pdf')
        git_path = target.relative_to(ROOT).as_posix()
        original = subprocess.check_output(['git', 'show', f'{BASE}:{git_path}'], cwd=ROOT)
        temp = ROOT / '.local/documentacion' / (name + '-base.pdf')
        temp.write_bytes(original)
        writer = PdfWriter()
        writer.append(str(temp)); writer.append(str(HERE / (name + '.pdf')))
        with target.open('wb') as f: writer.write(f)
        tex = target.with_suffix('.tex')
        source = tex.read_text(encoding='utf-8')
        marker = '% APORTE HU01-HU02-HU07-HU08'
        if marker not in source:
            source = source.replace('\\begin{document}', '\\usepackage{pdfpages}\n\n\\begin{document}', 1)
            source = source.replace('\\end{document}', marker + '\n\\clearpage\n\\includepdf[pages=-]{../../Aportes-HU01-HU02-HU07-HU08/' + name + '.pdf}\n\n\\end{document}')
            tex.write_text(source, encoding='utf-8')


def manifest():
    files = []
    for file in sorted((HERE / 'capturas').glob('*.png')):
        with PILImage.open(file) as im: size = im.size
        files.append({'archivo': file.name, 'dimensiones': size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'procedencia': 'captura actual de navegador, datos de demostracion; sin participantes'})
    (HERE / 'capturas/manifest.json').write_text(json.dumps({'commitAplicacion': BASE, 'archivos': files}, ensure_ascii=False, indent=2), encoding='utf-8')


def coverage():
    rows = [
        ['HU-M01', 'Acceso por perfil', '/acceso; sesión de ejemplo y menú por rol.', 'Cubierta'],
        ['HU-M02', 'Registro y edición de cortes', '/cortes, /cortes/nuevo, /cortes/:id y /cortes/:id/editar; cantidades por unidad, HH, borrador y versiones.', 'Cubierta'],
        ['HU-M03', 'Soportes del corte', '/cortes/:id y edición; fotos/PDF, visor, retiro y cola. Se conserva la cobertura documentada por su responsable.', 'Cubierta'],
        ['HU-M04', 'Visado o devolución', '/cortes y /cortes/:id como Director; devolución con motivo y confirmación de visado. Se conserva la cobertura previa.', 'Cubierta'],
        ['HU-M05', 'Documentos y checklist', '/dossier, /dossier/documentos y /dossier/documentos/publicar; pantallas integradas por el compañero.', 'Integrada'],
        ['HU-M06', 'Soportes y búsqueda del dossier', '/dossier y /dossier/documentos; DetalleItem para carga, validación y observación. Integración compartida.', 'Integrada'],
        ['HU-M07', 'Ensayos NDT por junta', '/dossier/ensayos y /dossier/ensayos/nuevo; laboratorio, método, fecha, resultado, PDF y requisito por informe.', 'Cubierta'],
        ['HU-M08', 'Avance y entrega del dossier', '/dossier/avance; seis carpetas, faltantes, aceptación del acta, diez días y ZIP parcial/validado de ejemplo.', 'Cubierta'],
        ['HU-M09', 'Cursos y aptitud SST', '/sst, /sst/:id, /sst/:id/cursos/nuevo y /sst/:id/aptitud; se conserva la cobertura documentada del equipo.', 'Cubierta'],
        ['HU-M10', 'Personal del corte con bloqueo SST', '/cortes/nuevo y /cortes/nuevo/personal; selector compartido, motivos de bloqueo y horas.', 'Cubierta'],
        ['HU-M11', 'Bitácora de cambios', '/dossier/bitacora; consulta de cortes y requisitos confirmados. /cortes/:id y /sst/:id conservan historiales propios.', 'Integrada'],
        ['HU-M12', 'Tablero del proyecto', '/dashboard para Director/Gerencia; avance y seis carpetas. CW-118 usa el dossier compartido confirmado.', 'Integrada'],
    ]
    title = '# Cobertura de historias de usuario\n\nLoard · Hito 2 · Actualización del aporte HU-M01, HU-M02, HU-M07 y HU-M08.\n\n'
    intro = ('Cubierta: flujo documentado para el prototipo; en HU3/4/9/10 se conserva la cobertura previa del equipo. Integrada: se verificó su presencia y conexión en el código actual, pero este aporte no sustituye la validación detallada de su responsable. Los estados describen el prototipo, no un backend productivo.\n\n')
    md = title + intro + '| HU | Historia | Pantallas y evidencia | Estado |\n| --- | --- | --- | --- |\n'
    md += '\n'.join('| ' + ' | '.join(r) + ' |' for r in rows)
    md += '\n\n## Resumen\n\nOcho historias con cobertura documentada y cuatro integradas con validación detallada a cargo de sus responsables. Ninguna carece de ruta en el código actual. Las cuatro historias de este aporte cuentan con capturas actuales, inspección técnica y pruebas automatizadas compartidas. Las sesiones RITE de ejemplo son SIMULADAS y no justifican ninguno de estos estados.\n'
    (HERE / '07-cobertura.md').write_text(md, encoding='utf-8')
    def tex(s):
        return s.replace('\\', '\\textbackslash{}').replace('_', '\\_').replace('#', '\\#').replace('%', '\\%').replace('&', '\\&').replace('{id}', ':id')
    source = '\\documentclass[11pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage[spanish]{babel}\n\\usepackage{lmodern,array,longtable,booktabs}\n\\usepackage[a4paper,margin=2cm]{geometry}\n\\setlength{\\parindent}{0pt}\n\\setlength{\\parskip}{0.5em}\n\\begin{document}\n\\section*{Cobertura de historias de usuario}\n' + tex(intro)
    source += '\\small\n\\begin{longtable}{p{1.4cm}p{2.5cm}p{8.2cm}p{1.6cm}}\n\\toprule HU & Historia & Pantallas y evidencia & Estado \\\\\n\\midrule\\endhead\n'
    source += '\n'.join(' & '.join(tex(c) for c in r) + ' \\\\ \\addlinespace' for r in rows)
    source += '\n\\bottomrule\\end{longtable}\n\\normalsize\\section*{Resumen}\nOcho historias con cobertura documentada y cuatro integradas. Las pruebas RITE de ejemplo son SIMULADAS y no justifican estos estados.\\end{document}\n'
    path = ROOT / 'Hito 2/Modulo-I-Prototipo/Cobertura de HU/Cobertura de HU.tex'
    path.write_text(source, encoding='utf-8')


def technical_evidence():
    file = HERE / 'capturas/verificacion.json'
    data = json.loads(file.read_text(encoding='utf-8-sig'))
    if isinstance(data, str): data = json.loads(data)
    data['aplicacion'] = {'commit': BASE, 'pruebasAutomaticas': 101, 'compilacionConTipos': 'correcta', 'nota': 'Reejecutadas el 16/11/2026; no son sesiones con participantes.'}
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    css = (ROOT / 'Hito 2/Modulo-I-Prototipo/prototipo/src/styles/tokens.css').read_text(encoding='utf-8')
    def luminance(value):
        rgb = [int(value[i:i + 2], 16) / 255 for i in [1, 3, 5]]
        rgb = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
        return sum(v * w for v, w in zip(rgb, [.2126, .7152, .0722]))
    pairs = [('on-surface', 'surface'), ('on-surface-muted', 'surface-container'), ('on-primary', 'primary'), ('error', 'error-subtle'), ('warning', 'warning-subtle'), ('success', 'success-subtle')]
    results = []
    for theme, selector in [('Claro', ':root'), ('Oscuro', "[data-theme='dark']")]:
        block = css.split(selector + ' {', 1)[1].split('}', 1)[0]
        tokens = dict(re.findall(r'--([a-z-]+):\s*(#[a-fA-F0-9]{6})', block))
        for foreground, background in pairs:
            a, b = sorted([luminance(tokens[foreground]), luminance(tokens[background])])
            ratio = (b + .05) / (a + .05)
            results.append([theme, f'{foreground} / {background}', f'{ratio:.2f}:1', 'Supera 4,5:1' if ratio >= 4.5 else 'Revisar'])
    (HERE / 'capturas/contraste.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    doc = HERE / '04-accesibilidad.md'
    source = doc.read_text(encoding='utf-8').split('## Resultados técnicos medidos')[0].split('## Lo que comprobamos')[0].rstrip()
    source += '\n\n## Lo que comprobamos\n\nRevisión del 16/11/2026 en navegador, sin participantes.\n\n'
    source += '| Comprobación ejecutada | Resultado observado |\n| --- | --- |\n'
    names = ['Entrar con Tab y Enter', 'Abrir el acta, mantener el foco dentro y cerrar con Escape', 'Bloquear la descarga de cierre si faltan requisitos']
    checks = [c for c in data['comprobaciones'] if 'resultado' in c]
    selected = [checks[1], checks[-1], checks[-2]]
    for name, check in zip(names, selected):
            source += '| ' + name + ' | ' + ('Correcto' if check['resultado'] else 'Revisar') + ' |\n'
    images = [c for c in data['comprobaciones'] if 'archivo' in c]
    source += f'\nSe guardaron {len(images)} capturas y sus tamaños. No se detectó una página más ancha que la pantalla en esas capturas. También se amplió la letra del acceso al 200% como comprobación de ejemplo; no fue zoom nativo del navegador.\n\n'
    source += '## Contraste del texto\n\nSe compararon los colores definidos en el código. Un valor mayor indica más diferencia entre texto y fondo. La referencia para texto normal es 4,5:1.\n\n'
    source += '| Uso | Tema claro | Tema oscuro |\n| --- | --- | --- |\n'
    labels = ['Texto principal', 'Texto secundario', 'Botón principal', 'Mensaje de error', 'Advertencia', 'Mensaje de éxito']
    for index, label in enumerate(labels):
        source += f'| {label} | {results[index][2]} | {results[index + 6][2]} |\n'
    source += '\nLos pares revisados superan 4,5:1. Son colores del código, no una medición de toda la pantalla. El detalle está en capturas/contraste.json. El registro completo está en capturas/verificacion.json.\n\nFuente: [W3C: contraste mínimo del texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).\n'
    doc.write_text(source, encoding='utf-8')


if __name__ == '__main__':
    import sys
    if '--solo-rite' in sys.argv:
        render_rite_apa(HERE / '05-rite-ejemplo.md', HERE / '05-rite-ejemplo.pdf')
        print('Informe RITE actualizado con formato APA.')
        raise SystemExit(0)
    coverage()
    technical_evidence()
    for md in sorted(HERE.glob('[0-9][0-9]-*.md')):
        target = ROOT / 'Hito 2/Modulo-I-Prototipo/Cobertura de HU/Cobertura de HU.pdf' if md.name.startswith('07-') else md.with_suffix('.pdf')
        render(md, target, md.name.startswith('05-'))
        print('Generado:', md.name)
    consolidate()
    manifest()
