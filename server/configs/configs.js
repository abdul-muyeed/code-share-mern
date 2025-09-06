import dotenv from "dotenv";
dotenv.config();
export let configs;
if (process.env.NODE_ENV === "prod") {
    configs = {
        CLIENT_URL: "https://code-share-mern.vercel.app/",
        MONGODB_URI: process.env.MONGODB_URI,
        PORT: process.env.PORT,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        NODE_ENV: process.env.NODE_ENV
    }
} else {
    configs = {
        CLIENT_URL: "http://localhost:5173/",
        MONGODB_URI: process.env.MONGODB_URI,
        PORT: process.env.PORT,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        NODE_ENV: process.env.NODE_ENV
    }
}
// check if any value is undefined
for (const [key, value] of Object.entries(configs)) {
    if (value === undefined) {
        console.error(`Error: ${key} is not defined in environment variables`);
        process.exit(1);
    }
}

