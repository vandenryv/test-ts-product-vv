This project is a technical test.

To run:
- start start the compose.yaml : to start the database
- run "npm run prisma:generate" to generate prisma classes
    
to run in development mode : 
  - run "npm run dev"
  
to run in production mode :

  - copy [.env.production.sample](config/.env.production.sample) as [.env.production](config/.env.production.sample)
  - run "npm run start"

to integrate data as json file : put your data in the sample folder and run the app with the argument --import-json sample.json example "npm run dev -- --import-json sample.json"