# Install dependencies for prosumerAppUI
Set-Location .\src\appProsumer\prosumerAppUI
npm install

# Start prosumerAppUI on port 4200 in a new tab
Start-Process "pwsh" -Verb NewTab -ArgumentList "-Command &{ & 'C:\Users\Milovan\AppData\Roaming\npm\node_modules\@angular\cli\bin\ng' serve --port 4200 }"

# Open new PowerShell window or tab and navigate to the project directory

# Install dependencies for dsoAppUI
Set-Location ..\..\appDSO\dsoAppUI
npm install

# Start dsoAppUI on port 4201 in a new tab
Start-Process "pwsh" -Verb NewTab -ArgumentList "-Command &{ & 'C:\Users\Milovan\AppData\Roaming\npm\node_modules\@angular\cli\bin\ng' serve --port 4201 }"

# Open new PowerShell window or tab and navigate to the project directory

# Install dependencies for prosumerAppBack
Set-Location ..\..\appProsumer\prosumerAppBack
dotnet tool install --global dotnet-ef
dotnet ef database update
dotnet restore

# Start prosumerAppBack
dotnet run

Set-Location ..\..
