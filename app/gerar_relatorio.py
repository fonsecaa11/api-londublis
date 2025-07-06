from fpdf import FPDF
import tempfile

def gerar_relatorio(lat, lon, morada, codigo_postal):
    try:
        # Criar o PDF
        pdf = FPDF()
        pdf.add_page()

        # Título
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(200, 10, txt="Relatório de Localização", ln=True, align='C')

        # Adicionar espaçamento
        pdf.ln(10)

        # Dados de coordenadas
        pdf.set_font('Arial', '', 12)
        pdf.cell(200, 10, txt=f"Latitude: {lat}", ln=True)
        pdf.cell(200, 10, txt=f"Longitude: {lon}", ln=True)

        # Adicionar mais espaçamento
        pdf.ln(10)

        # Dados de morada
        if morada:
            pdf.cell(200, 10, txt=f"Morada: {morada}", ln=True)

        # Adicionar mais espaçamento
        pdf.ln(10)

        # Dados de código postal
        if codigo_postal:
            pdf.cell(200, 10, txt=f"Código Postal: {codigo_postal}", ln=True)

        # Salvar o arquivo PDF temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            arquivo_pdf = tmp_file.name
            pdf.output(arquivo_pdf)

        return arquivo_pdf

    except Exception as e:
        print(f"Erro ao gerar o relatório: {e}")
        return None
