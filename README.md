//Npm
npm install
npm run dev

//BDD
npx prisma generate
npx prisma migrate dev
npx prisma studio

//Tailwind

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

// .env si local

si local, sinon changer la route
DATABASE_URL="file:./dev.db"

spotify
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
