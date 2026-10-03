// Free-first logic: email OR phone match on non-Rejected requests => not first.
// Override requires reason + audit row. PBKDF2 salted hash for passwords.
public static class FreeConsultationService
{
  public static bool IsFirstFree(string email,string phone,IEnumerable<(string Email,string Phone,string Status)> prior)
  {
    email=(email??"").Trim().ToLower(); var ph=new string((phone??"").Where(char.IsDigit).ToArray());
    return !prior.Any(r=>r.Status!="Rejected"&&(r.Email.ToLower()==email||new string(r.Phone.Where(char.IsDigit).ToArray())==ph));
  }
}
