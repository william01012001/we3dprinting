FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV QT_QPA_PLATFORM=offscreen
ENV QTWEBENGINE_DISABLE_SANDBOX=1
ENV QTWEBENGINE_CHROMIUM_FLAGS=--no-sandbox
ENV HOME=/tmp
ENV XDG_RUNTIME_DIR=/tmp/runtime-root
ENV PYTHONPATH=/usr/lib/freecad-python3/lib
ENV LD_LIBRARY_PATH=/usr/lib/freecad-python3/lib

RUN apt-get update \
  && apt-get install -y --no-install-recommends freecad python3 python3-pivy \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /tmp/runtime-root \
  && chmod 700 /tmp/runtime-root

WORKDIR /app

COPY package.json ./

RUN npm install --production=false express@^4.19.2 multer@^1.4.5-lts.1 cors@^2.8.5 nodemailer@^6.9.15 \
  && node -e "require('express'); console.log('express OK')" \
  && node -e "require('multer'); console.log('multer OK')" \
  && npm cache clean --force

COPY . .

# Check Python can at least start. Full FreeCAD health runs at /api/cad-health.
RUN python3 --version

EXPOSE 3000

CMD ["node", "server.js"]
