FROM node:22.11.0-bookworm-slim

ENV NODE_ENV=production \
	PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-pip python3-venv \
	&& ln -sf /usr/bin/python3 /usr/local/bin/python \
	&& pip3 install --upgrade pip \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY requirements.txt ./python-requirements.txt
RUN pip3 install --no-cache-dir -r python-requirements.txt

COPY . .

RUN chmod +x ./start.sh

EXPOSE 8080 8000

CMD ["./start.sh"]
