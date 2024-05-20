using Microsoft.EntityFrameworkCore;
using Task = API.Models.Task;

namespace API.Data;

public class TaskDbContext:DbContext
{
    public TaskDbContext(DbContextOptions options) : base(options)
    {
    }
    
    public DbSet<Task> Tasks { get; set; }
}