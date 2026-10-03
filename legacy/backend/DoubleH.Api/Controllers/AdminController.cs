using Microsoft.AspNetCore.Mvc;
namespace DoubleH.Api.Controllers;
[ApiController,Route("api/admin")]
public class AdminController : ControllerBase
{
  // All endpoints require [Authorize] + lockout + audit in production. Demo scaffold.
  [HttpPost("auth/login")] public IActionResult Login([FromBody] LoginDto d)
  {
    if(d.Email=="admin@doubleh.com"&&d.Password=="Admin123!") return Ok(new{token="demo-jwt-replace-with-real"});
    return Unauthorized();
  }
  [HttpPost("auth/logout")] public IActionResult Logout()=>Ok();
  [HttpGet("requests")] public IActionResult List()=>Ok(Array.Empty<object>());
  [HttpPatch("requests/{id}")] public IActionResult Patch(int id,[FromBody] PatchDto d)
  {
    if(d.IsFirstFree!=null&&string.IsNullOrWhiteSpace(d.OverrideReason)) return BadRequest("Override reason required + audit log");
    return Ok();
  }
  [HttpGet("reports")] public IActionResult Reports()=>Ok(new{byStatus=new{},byCategory=new{},freeVsStandard=new{}});
  public record LoginDto(string Email,string Password);
  public record PatchDto(string? Status,string? AdminNotes,bool? IsFirstFree,string? OverrideReason,string? ScheduledAt);
}
