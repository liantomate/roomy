## Project Architecture

The project is split into 3 layers: **Frontend**, **API**, and **Backend**
In this specific repository however, only Frontend and the API are the concern

### Frontend

The frontend is divided into four primary sublayers:

- **Presentation**: this layer contains UI-related features, specifically, everything that is directly visible to the user. This layer only concerns how elements are displayed, not how things work under the hood when actions are performed
- **Logic**: this layer contains mechanics-related features working under the hood, specifically for reacting to changes and events. The presentation layer cannot directly access the logic layer, and vice versa for design purposes
- **Middle Hook**: the _Presentation_ layer can communicate with the _Logic_ through this layer
- **After Hook**: this layer sits below the _Logic_ layer and is for abstracting and keeping the logic layer in a single responsibility, without getting too involved with the API

### API

The API layer is a wrapper layer for Supabase-provided APIs, this layer abstracts the lower layer to allow the higher layers (mentioned above) to focus on feature-related implementations

## Folder Structure

Code of the two layers mentioned are found in the source (**src**) folder
Shared assets like font files and icon are found in the **public** folder
Core-related tests are found in the **test** folder
Documentations for knowing about the project is found in the documentation (**docs**) folder

### Source Folder

The **Presentation** layer implementations are found on the following folders:

- **assets**: contains images, tiny sounds, and other light assets to be used in the project
- **components**: contains all the React components making up the pages
- **pages**: contains the component compilations, state management, and other functionalities of different pages
- **styles**: contains CSS for the different components of the project
- **app**: basic folder for page routing

The **Logic** layer implementations are found on the following folder:

- **core**: contains all the logic feature-related code, the functionality of the project
- **types**: contains shared types that can be used by any layer to ensure the project stays neat when referring to shared resources

The **API** layer implementations are found in the **api** folder
