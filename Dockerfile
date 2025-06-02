FROM node:18.20.3

# Diretório da app
WORKDIR .

# Copia os arquivos (se quiser manter leve, use COPY package*.json primeiro)
COPY . .

# Instala o que quiser com npm (como redis depois)
RUN npm install

# Porta padrão da app
EXPOSE 4000

CMD ["npm", "run", "dev"]