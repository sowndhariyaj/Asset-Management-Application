# Initialization of Project

Created a asset management application React Project

## Installed Required Dependencies

Installed mantine UI , supabase , Tanstack Query , Zustand

### `npm start`

Runs the app in http://localhost:3000 .

### Supabase Setup

Created Supabase Project
Configured the Supabase in the application by creating a supabaseClient.js file

### Supabase Authentication

Integrated Supabase Authentication for login and logout.

Created login function for users to authenticate and logout function to signout.

### Database Setup

Created a profiles table in the Supabase.

Created an assets table to store all the asset details in the supabase.

### Role Management

Added logic in the application to differentiate between Admin and Management users based on the role field in the profiles table.

### Assets Management

Implemented CRUD operations for all the assets.

Created a new assets .

List out all the assets.

Updates of a existing assets in the edit assets section.

Deletion of the particular assets.

### Pagination ,Filtering 

Implemented pagination and filtering for the assets lists.

Pagination is done using mantine.

Filtering is done by added a search bar of search assets button for filtering the assets.

### Profile Management 

Created a profile page where users can view and update their personal information (first name, last name, and designation).

Ensured that only regular users (Management) can edit their profiles. Admins are restricted from editing user profiles.

### User Registration Form

Created a user registration form to allow new users to register.

Saved the registered users in the profiles table  in supabase with the role as "Management".

## UI Styling and Layout

Used Mantine UI for styling components such as buttons, forms, and tables.

Applied custom styles like styled table headers in blue for Admin users,

Positioned the logout buttons to the right end of the top of the page,

Added spacing between buttons (login/logout, edit/delete).

### Github Repository

Created a Github repository of Asset Management Application and uploaded all the files in it.

git init
git config --global user.name "sowndhariyaj"
git config --global user.email "sowndhariyajayaraju@gmail.com"
git add .
git commit -m "created asset management"
git remote add origin https://github.com/sowndhariyaj/Asset-Management-Application.git
git push origin -u master 
