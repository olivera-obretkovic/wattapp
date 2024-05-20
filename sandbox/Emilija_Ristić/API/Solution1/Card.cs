namespace Cards.API.Models {
	public class Card
	{
	[Key]
	public Guid ID { get; set; }
	public string CardHolderName { get; set; }
	public string CardNumber { get; set; }
	public int ExpireMonth { get; set; }
	public int ExpireYear { get; set; }
	public int CVC { get; set; }
	}
}