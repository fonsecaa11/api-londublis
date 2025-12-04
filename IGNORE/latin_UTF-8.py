import pandas as pd

# Caminho do ficheiro CSV original
input_file = "freguesia_rows.csv"

# Caminho do Excel de saída
output_file = "freguesias_corrigido.xlsx"

# Lê o CSV tentando corrigir encoding automaticamente
df = pd.read_csv(input_file, sep=";", encoding="latin1")

# Converte para UTF-8 no Excel
df.to_excel(output_file, index=False)

print("Ficheiro Excel criado com acentos corrigidos:", output_file)
