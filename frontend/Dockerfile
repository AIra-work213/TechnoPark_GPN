FROM node:20.18.0-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:1.27.3-alpine AS runtime

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
