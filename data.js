const memberPhotoPath = './images/members/';
		const members = [
			{ name: 'Alfonso Ramos', 	role: 'President', 				image: 'alfonso.png', 	email:'fallbrooklions@gmail.com'},
			{ name: 'Gus Romero', 		role: 'First Vice President', 	image: 'gus.png' },
			{ name: 'Sharon Zornes', 	role: 'Treasurer', 				image: 'sharon.png' },
			{ name: 'Karina Young', 	role: 'Secretary', 				image: 'karina.png' },
			{ name: 'Val Fujihara', 	role: 'Membership Chairperson', image: 'val.png', 		email:'valjk@att.net' },
			{ name: 'Lorene Morris', 	role: 'Service Chairperson,Second Vice President', 	image: 'lorene.png' },
		];

		const photoPath = 'https://fallbrooklions.com/images/photos/';
		const photos = [
			{ file: 'christmas1.jpg', 		caption: 'Fallbrook Lions at the Fallbrook Christmas Parade' },
			{ file: 'christmas2.jpg', 		caption: 'Fallbrook Lions at the Fallbrook Christmas Parade' },
			{ file: 'christmas3.jpg', 		caption: 'Fallbrook Lions at the Fallbrook Christmas Parade' },
			{ file: 'garden1.jpg', 			caption: 'Fallbrook Lions helping at the La Paloma School Garden' },
			{ file: 'garden2.jpg', 			caption: 'Fallbrook Lions helping at the La Paloma School Garden' },
			{ file: 'garden3.jpg', 			caption: 'Fallbrook Lions helping at the La Paloma School Garden' },
			{ file: 'ironman1.jpg', 		caption: 'Fallbrook Lions volunteering at the Ironman' },
			{ file: 'avocadofestival.jpg', 	caption: 'Fallbrook Lions at the Avocado Festival' },
		];

		const minutesPathTemplate = '/minutes/{D}-{YY} Fallbrook Ranch Lions Club meeting minutes.pdf';

		const meetingNotices = [
			{
				text: 'Happy Holidays! No more meetings for 2025.',
				start: null,
				end: '2026-01-01T00:00:00'
			}
		]

		const datesByYear = {
			2025: [
				"02-25", "03-11", "03-25", "04-08", "04-22",
				"05-13", "05-27", "06-10", "06-24", "07-08", "07-22", "08-12", "08-26",
				"09-09", "09-23", "10-14", "10-28", "11-18"
			],
			2026: [
				"01-13", "01-27", "02-10", "02-24",
				"03-10", "03-24", "04-14", "04-28",
				"05-12", "05-26", "06-09", "06-23",
				"07-14", "07-28", "08-11", "08-25",
				"09-08", "09-22", "10-13", "10-27",
				"11-10", "11-24"
			],
			2027: [
				"01-12", "01-26", "02-09", "02-23",
				"03-09", "03-23", "04-13", "04-27",
				"05-11", "05-25", "06-08", "06-22",
				"07-13", "07-27", "08-10", "08-24",
				"09-14", "09-28", "10-12", "10-26",
				"11-09", "11-23"
			]			
		};

		const announcements = [
		{
			title: "Rummage Sale Fundraiser",
			content: `
			<p>The Fallbrook Ranch Lions Club is hosting a <strong>Rummage Sale</strong>; All proceeds support the club's <strong>Sight Campaign</strong>, which provides eye exams and glasses for students in need at local elementary schools.</p>
			<p><strong>Items for Sale:</strong></p>
			<p>Clothes, Plants, Furniture, Housewares, Small Appliances, Misc. Items</p>
			`,
			date_end: "2026-02-21",
			date: "Saturday, February 21",
			time: "10:00&nbsp;AM – 3:00&nbsp;PM",
			location: "Community Health & Wellness Center, 1636 E. Mission Rd., Fallbrook",
			links: [
			{
				href: "./files/Rummage Sale 8.5x11 color.pdf",
				label: "Download Flyer",
				icon: "fa-file-arrow-down"
			},
			{
				href: "https://maps.app.goo.gl/kfxLbUSMyRGHMvMB9",
				label: "Google Maps",
				icon: "fa-map-location-dot"
			}
			]
		}
		];