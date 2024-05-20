builder.Services.AddDbContext<CardsDbContext>(options => 
options.UseSqlServer(builder.Configuration.GetConnectionString("CardsDbConnectionString"));