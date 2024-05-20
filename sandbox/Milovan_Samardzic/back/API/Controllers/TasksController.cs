using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Task = API.Models.Task;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController:ControllerBase
{
    private readonly TaskDbContext _taskDbContext;
    public TasksController(TaskDbContext taskDbContext)
    {
        _taskDbContext = taskDbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTasks()
    {
        return Ok(await _taskDbContext.Tasks.ToListAsync());
    }
    
    [HttpGet]
    [Route("{id:guid}")]
    [ActionName(("GetTask"))]
    public async Task<IActionResult> GetTask([FromRoute] Guid id)
    {
        var task = await _taskDbContext.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (task != null)
            return Ok(task);
        return NotFound("Task not found");
    }

    [HttpPost]
    public async Task<IActionResult> AddTask([FromBody] Task task)
    {
        task.TaskID = Guid.NewGuid();
        await _taskDbContext.Tasks.AddAsync(task);
        await _taskDbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask),new{id = task.TaskID},task);
    }
    [HttpPut]
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateTask([FromRoute] Guid id, [FromBody] Task task)
    {
        var existingTask = await _taskDbContext.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (existingTask == null) return NotFound("Task not found");
        existingTask.TaskDescription = task.TaskDescription;
        await _taskDbContext.SaveChangesAsync();
        return Ok(existingTask);

    }
    
    [HttpDelete]
    [Route("{id:guid}")]
    public async Task<IActionResult> DeleteTask([FromRoute] Guid id)
    {
        var existingTask = await _taskDbContext.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (existingTask == null) return NotFound("Task not found");
        _taskDbContext.Remove(existingTask);
        await _taskDbContext.SaveChangesAsync();
        return Ok(existingTask);
    }
}