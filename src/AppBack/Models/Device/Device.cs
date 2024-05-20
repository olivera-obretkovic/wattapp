using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prosumerAppBack.Models.Device
{
	public class Device
	{
		[Key]
		public Guid ID { get; set; }
		public string? MacAdress { get; set; }
        public string? DeviceName { get; set; }
        public Guid DeviceTypeID { get; set; }
		public DeviceType DeviceType { get; set; }		
		public Guid OwnerID { get; set; }
		public User Owner { get; set; }
        public Boolean IsOn { get; set; }
        public Boolean dsoHasControl { get; set; }

    }
}

