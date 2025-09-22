import ollama

# Define o modelo que você quer usar (ex: "llama2")
model_name = "llama2"

# Defina o prompt que será passado ao modelo (isso pode ser dinâmico, como você mostrou)
pois = "Hospital, Escola, Supermercado"
freguesiaData = {
    "taxa_envelhecimento": 12.5,
    "taxa_desemprego": 8.3,
    "valor_renda_absoluto": 850,
    "taxa_criminalidade": 1.7,
    "taxa_mortalidade": 0.9
}

# Cria o prompt
summary_prompt = f"""
Resuma as seguintes informações sobre a localização:
- POIs encontrados: {pois}
- Dados da região: 
    - Taxa de Envelhecimento: {freguesiaData['taxa_envelhecimento']}
    - Taxa de Desemprego: {freguesiaData['taxa_desemprego']}%
    - Renda Média: {freguesiaData['valor_renda_absoluto']}€
    - Taxa de Criminalidade: {freguesiaData['taxa_criminalidade']}%
    - Taxa de Mortalidade: {freguesiaData['taxa_mortalidade']}%
"""

# Chama o modelo para obter a resposta
response = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": summary_prompt}])

# Exibe a resposta
print(response)
