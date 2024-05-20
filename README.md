# ENERGY SOLVIX

    EnergySolvix is a company that provides solutions to track energy consumption and 
    production in households and as a Distribution System Operator (DSO). 
    EnergySolvix offers a user-friendly mobile application that can be used 
    by households to track their energy consumption and production in real-time. 
    This app allows households to monitor their energy usage and make more informed decisions on how to save energy and reduce costs.

    In addition to providing solutions for households, EnergySolvix also offers software solutions for DSOs. 
    These solutions provide real-time monitoring of energy usage and production across the grid, 
    helping DSOs to optimize energy distribution and reduce power losses. 
    EnergySolvix's software solutions provide advanced analytics and reporting capabilities that help DSOs to make more informed decisions on managing energy distribution.

    With EnergySolvix's solutions, households and DSOs can monitor their energy usage and production 
    in a more efficient and cost-effective manner. This leads to a reduction in energy consumption, costs, and carbon footprint.
    EnergySolvix's solutions provide an easy-to-use platform that helps households and DSOs to make
    more informed decisions on energy usage, leading to a more sustainable future.

## Instructions on how to get the project on a local machine.

    - Open cmd and run command: git clone http://gitlab.pmf.kg.ac.rs/wattapp/energysolvix.git
    - Run start.sh to download all packages and to create sqlite database
    - Download MongoDB from https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows-unattended/
    - Install MongoDB and also install MongoDBCompass
    - Open Compass and connect to mongodb://localhost:27017
    - Add new database named 'data'
    - Add new collection inside database called 'powerusage'
    - Select ADD DATA and from root of project insert both power_usage_data and power_production_data

## Deployment

To deploy app, follow these steps:
### Angular

    Run ng build --prod to build the production version of the Angular app.
    The output files will be located in the dist/ directory.
    Copy the contents of the dist/ directory to your web server.

### .NET

    Compile the .NET app into a publishable format.
    You can publish the app to a folder or directly to a web server using Visual Studio or the .NET CLI.
    If publishing to a folder, copy the contents of the published directory to your web server.

### Deployment Configuration

    Make sure to update the configuration settings in the appsettings.json 
    file with the appropriate values for your deployment environment. 
    Specifically, ensure that the ConnectionStrings section points to your database, 
    and that the AllowedOrigins section contains the appropriate URLs for your Angular app.

## Credentials and links

    DSO:

    http://softeng.pmf.kg.ac.rs:10042

    admin@gmail.com:admin123

    Prosumer:

    http://softeng.pmf.kg.ac.rs:10043

    petarsimic@gmail.com:petar123

# Built With

    Angular
    .NET

# Authors

    Milovan
    Emilija
    Olja
    Darko
    Katarina
    Anastasija