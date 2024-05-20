using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using prosumerAppBack.BusinessLogic.DispatcherService;
using prosumerAppBack.Helper;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Dispatcher;
using System.Data;
using System.Text.Json;

namespace prosumerAppBack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Dispatcher,Admin")]
public class DispatcherController : ControllerBase
{
    private readonly IDispatcherService _dispatcherService;
    private readonly ITokenMaker _tokenMaker;
    public DispatcherController(ITokenMaker tokenMaker, IDispatcherService dispatcherService)
    {
        _dispatcherService = dispatcherService;
        _tokenMaker = tokenMaker;
    }

    [HttpPost("signup")]
    [AllowAnonymous]
    //[Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register(DispatcherRegisterDto userRegisterDto)
    {
        try
        {
            await _dispatcherService.CheckEmail(userRegisterDto.Email);

            await _dispatcherService.CreateDispatcher(userRegisterDto);

            return Ok(new { message = "User registered successfully" });
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpPost("signin")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] DispatcherLoginDto dispatcherLoginDto)
    {
        try
        {
            var user = await _dispatcherService.GetUserByEmailAndPasswordAsync(dispatcherLoginDto.Email, dispatcherLoginDto.Password);

            var token = _tokenMaker.GenerateToken(user);
            return Ok(JsonSerializer.Serialize(token));
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpPost("validate-token")]
    public ActionResult<object> ValidateToken([FromBody] object body)
    {
        string token = body.ToString();
        var result = _tokenMaker.ValidateJwtToken(token);

        if (!result)
        {
            return BadRequest("Invalid token");
        }

        return true;
    }

    [HttpGet("get-all-dispatchers")]
    public async Task<IActionResult> AllUsersInfo()
    {
        try
        {
            var results = await _dispatcherService.GetAllDispatchersAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("delete-dispathcer/{dispatcherID}")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDevice(Guid dispatcherID)
    {
        var action = await _dispatcherService.DeleteDispatcher(dispatcherID);
        if (!action)
        {
            return BadRequest("dispathcher has failed to be deleted");
        }

        return Ok(new { Message = "dispathcher deleted successfully" });
    }
    [HttpGet("get-single/{id}")]
    public async Task<IActionResult> UserInfo(Guid id)
    {
        try
        {
            var results = await _dispatcherService.GetDispatcher(id);

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("update-dispatcher/{id}")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] DispatcherUpdateDto dispatcherUpdateDto)
    {
        await _dispatcherService.UpdateDispatcher(id, dispatcherUpdateDto);

        return Ok(new { message = "dispatcher updated successfully" });
    }

    [HttpPut("update-password-for-dispatcher/{id}")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDispatcherPassword(Guid id, DispatcherPasswordUpdate dispatcherPasswordUpdate)
    {
        await _dispatcherService.UpdateDispatcherPassword(id, dispatcherPasswordUpdate);

        return Ok(new { message = "password updated successfully" });
    }

    [HttpGet("get-users-application-history")]
    public async Task<IActionResult> GetAllUsersAplicationToDsoAsync()
    {
        try
        {
            var results = await _dispatcherService.GetAllUsersAplicationToDsoAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}

