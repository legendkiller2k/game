﻿using System;
using System.Data;
using gaseous_tools;

namespace gaseous_server.Classes
{
	public class Roms
	{
		public static List<RomItem> GetRoms(long GameId)
		{
            Database db = new gaseous_tools.Database(Database.databaseType.MySql, Config.DatabaseConfiguration.ConnectionString);
            string sql = "SELECT * FROM games_roms WHERE gameid = @id ORDER BY `name`";
            Dictionary<string, object> dbDict = new Dictionary<string, object>();
            dbDict.Add("id", GameId);
            DataTable romDT = db.ExecuteCMD(sql, dbDict);

            if (romDT.Rows.Count > 0)
            {
				List<RomItem> romItems = new List<RomItem>();
				foreach (DataRow romDR in romDT.Rows)
				{
					romItems.Add(BuildRom(romDR));
				}

				return romItems;
            }
            else
            {
                throw new Exception("Unknown Game Id");
            }
        }

		public static RomItem GetRom(long RomId)
		{
			Database db = new gaseous_tools.Database(Database.databaseType.MySql, Config.DatabaseConfiguration.ConnectionString);
			string sql = "SELECT * FROM games_roms WHERE id = @id";
			Dictionary<string, object> dbDict = new Dictionary<string, object>();
			dbDict.Add("id", RomId);
			DataTable romDT = db.ExecuteCMD(sql, dbDict);

			if (romDT.Rows.Count > 0)
			{
				DataRow romDR = romDT.Rows[0];
				RomItem romItem = BuildRom(romDR);
				return romItem;
			}
			else
			{
				throw new Exception("Unknown ROM Id");
			}
		}

		private static RomItem BuildRom(DataRow romDR)
		{
            RomItem romItem = new RomItem
            {
                Id = (long)romDR["id"],
                PlatformId = (long)romDR["platformid"],
                GameId = (long)romDR["gameid"],
                Name = (string)romDR["name"],
                Size = (long)romDR["size"],
                CRC = (string)romDR["crc"],
                MD5 = (string)romDR["md5"],
                SHA1 = (string)romDR["sha1"],
                DevelopmentStatus = (string)romDR["developmentstatus"],
                Flags = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>((string)romDR["flags"]),
                RomType = (int)romDR["romtype"],
                RomTypeMedia = (string)romDR["romtypemedia"],
                MediaLabel = (string)romDR["medialabel"],
                Path = (string)romDR["path"]
            };
            return romItem;
        }

		public class RomItem
		{
			public long Id { get; set; }
			public long PlatformId { get; set; }
			public long GameId { get; set; }
			public string? Name { get; set; }
			public long Size { get; set; }
			public string? CRC { get; set; }
			public string? MD5 { get; set; }
			public string? SHA1 { get; set; }
			public string? DevelopmentStatus { get; set; }
			public string[]? Flags { get; set; }
			public int RomType { get; set; }
			public string? RomTypeMedia { get; set; }
			public string? MediaLabel { get; set; }
			public string? Path { get; set; }
        }
	}
}

