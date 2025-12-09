# dfs

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test dfs` to execute the unit tests.

## How to use App

1. Go to DraftKings.com and open a lineup builder for the type of contest you will be entering
2. Click the "Export to CSV" button below the lineup builder
3. Move file to libs/draftkings/dfs/src/lib/utils folder
4. Open file and copy everything, then assign it as a string to the salaries variable inside of salaries.ts
5. Go to /dfs/setup in browser and set your desired player pool for each position

## TODO: Next Steps

1. Update Cloud function to get other projection data
2. Include total projected points (not PPD) for each lineup when calculating lineup score. Factor in both DFS Pass projections and ESPN.
   If no TE found when generating lineups, consider ignoring ownership limits and trying again?
   If no flex found when generating lineups, consider ignoring ownership limits for WRs and trying again?
3. Add logic to set logical usages for pass catchers when they're teammates/opponents of QB
4. Create new component for Slate info cards in slate-setup-page to reduce duplicate code
5. Implement better error handling
6. Implement loading states
7. Try new Agent Review feature in Cursor to identify potential issues with code.

- Ask Gemini the following questions:
  - "How can I implement real-time updates for slateData using Firestore's onSnapshot and NgRx Signal Store?"
  - "What are the best practices for handling errors and displaying user-friendly messages when Firestore queries fail?"
  - How do I integrate Firebase Authentication into my Angular app to use request.auth in my security rules
