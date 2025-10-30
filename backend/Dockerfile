FROM node:22.11.0-bookworm-slim

ENV NODE_ENV=production \
	PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-venv \
	&& python3 -m venv /opt/venv \
	&& /opt/venv/bin/pip install --upgrade pip \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:${PATH}"

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY requirements.txt ./python-requirements.txt
RUN pip install --no-cache-dir -r python-requirements.txt

COPY . .

RUN chmod +x ./start.sh

EXPOSE 8080 8000

CMD ["./start.sh"]
