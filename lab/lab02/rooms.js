var roomdata = { 

	rooms : [
	{
		"roomname":"S1",
		"coords":[7, 51, 129, 183],
		"classes":[{"time":"8h", "classname":"PE"}, {"time":"10h", "classname":"EO"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"ASA"}, {"time":"16h", "classname":"none"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"S2",
		"coords":[177, 50, 307, 181],
		"classes":[{"time":"8h", "classname":"ACED"}, {"time":"10h", "classname":"TC"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"none"}, {"time":"16h", "classname":"ACED"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"S3",
		"coords":[309, 52, 438, 181],
		"classes":[{"time":"8h", "classname":"none"}, {"time":"10h", "classname":"ACED"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"PE"}, {"time":"16h", "classname":"TC"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"A1",
		"coords":[7, 188, 132, 442],
		"classes":[{"time":"8h", "classname":"none"}, {"time":"10h", "classname":"none"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"ACED"}, {"time":"16h", "classname":"PE"}, {"time":"18h", "classname":"EO"}]
	},

	{
		"roomname":"A2",
		"coords":[177, 187, 435, 440],
		"classes":[{"time":"8h", "classname":"none"}, {"time":"10h", "classname":"none"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"ASA"}, {"time":"16h", "classname":"IPM"}, {"time":"18h", "classname":"TC"}]
	},

	{
		"roomname":"Lab1",
		"coords":[132, 617, 6, 485],
		"classes":[{"time":"8h", "classname":"IPM"}, {"time":"10h", "classname":"IAED"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"ES"}, {"time":"16h", "classname":"none"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"Lab2",
		"coords":[178, 487, 304, 616],
		"classes":[{"time":"8h", "classname":"SD"}, {"time":"10h", "classname":"IPM"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"none"}, {"time":"16h", "classname":"COMP"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"Lab3",
		"coords":[308, 484, 441, 618],
		"classes":[{"time":"8h", "classname":"none"}, {"time":"10h", "classname":"COMP"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"IPM"}, {"time":"16h", "classname":"SD"}, {"time":"18h", "classname":"none"}]
	},

	{
		"roomname":"Lab4",
		"coords":[442, 486, 563, 616],
		"classes":[{"time":"8h", "classname":"none"}, {"time":"10h", "classname":"none"}, {"time":"12h", "classname":"none"}, {"time":"14h", "classname":"SD"}, {"time":"16h", "classname":"ES"}, {"time":"18h", "classname":"IAED"}]
	}
]
};


function getData() {
	return roomdata.rooms;
}
