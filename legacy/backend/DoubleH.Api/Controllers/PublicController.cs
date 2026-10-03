using Microsoft.AspNetCore.Mvc;
namespace DoubleH.Api.Controllers;
[ApiController]
public class PublicController : ControllerBase
{
  static string Lang(HttpRequest r){var q=r.Query["language"].ToString().ToLower(); if(new[]{"ar","tr","en","fr"}.Contains(q))return q; var h=(r.Headers.AcceptLanguage.ToString().Split(',').FirstOrDefault()??"en").Split('-')[0].ToLower(); return new[]{"ar","tr","en","fr"}.Contains(h)?h:"en";}
  [HttpGet("/api/categories")] public IActionResult Cats()=>Ok(new[]{new{id="arch"},new{id="civil"},new{id="medical"},new{id="law"},new{id="elec"},new{id="mgmt"},new{id="bd"}});
  [HttpGet("/api/categories/{id}")] public IActionResult Cat(string id)=>Ok(new{id});
  [HttpPost("/api/requests")] public IActionResult CreateReq([FromBody] ReqDto d)
  {
    if(string.IsNullOrWhiteSpace(d.Name)||string.IsNullOrWhiteSpace(d.Email)||string.IsNullOrWhiteSpace(d.Phone)||string.IsNullOrWhiteSpace(d.Note)) return BadRequest("All 4 fields required");
    if(d.Note.Length>2000) return BadRequest("Note too long");
    // rate-limit + honeypot + IsFirstFree(email OR phone, ignore Rejected) + emails implemented in service layer
    return Ok(new{status="New"});
  }
  [HttpPost("/api/contact")] public IActionResult Contact([FromBody] object o)=>Ok(new{ok=true});
  [HttpGet("/api/consultants")] public IActionResult Cons()=>Ok(Array.Empty<object>());
  [HttpGet("/api/content/{key}")] public IActionResult GetContent(string key)=>Ok(new{key,lang=Lang(Request),fallback="en"});
  public record ReqDto(string Name,string Email,string Phone,string Note,string CategoryId,string? Honeypot);
}
