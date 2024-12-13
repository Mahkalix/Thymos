//Npm
npm install
npm run dev

//BDD
npm install prisma --save-dev
npm install @prisma/client

npx prisma migrate dev
npx prisma generate
npm i @prisma/client@latest

(voir bdd)
npx prisma studio

// .env si local
si local, sinon changer la route
DATABASE_URL="file:./dev.db"

spotify
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
