const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
require('dotenv').config();

(async function run() {
	var html = `<table>
					<tr>
						<th>Name</th>
						<th>Services</th>
					</tr>`;
	const dignityMemorialBaseUrl = "https://www.dignitymemorial.com";
	const dignityMemorialIds = [2356, 4428, 4429, 4486, 4592, 4593, 4594, 4596, 4599];
	for await (const memorialId of dignityMemorialIds) {
		const fetchRequest = await fetch(`${dignityMemorialBaseUrl}/api/sitecore/FuneralHome/RecentObituariesComponent`, {
			"credentials": "include",
			"headers": {
				"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0",
				"Accept": "application/json, text/javascript, */*; q=0.01",
				"Accept-Language": "en-US,en;q=0.5",
				"Content-Type": "application/json; charset=utf-8",
				"X-Requested-With": "XMLHttpRequest",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-origin"
			},
			"body": `{"locationId":${memorialId}}`,
			"method": "POST",
			"mode": "cors"
		});
			const fetchData = await fetchRequest.json();
			// console.log(fetchData.Obituaries);
			fetchData.Obituaries.forEach(obit => {
				html += `<tr>
							<td><a href="${dignityMemorialBaseUrl}${obit.ObituaryUrl}">${obit.FullName}</a></td>
							<td>`;
				// console.log(obit.FullName, `${dignityMemorialBaseUrl}${obit.ObituaryUrl}`);
				obit.ScheduledServices.forEach(srvcs => {
					//console.log(srvcs.EventName, srvcs.EventDateTime);
					html += `<ul>${srvcs.EventName}: ${srvcs.EventDateTime}</ul>`;
				});
				html += '</td></tr>';
			});
		};
	
	html += '</table>';
	//console.log(html);
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
		}
	});
	await transporter.sendMail({
		from: process.env.DAILY_REPORT_FROM,
		to: process.env.DAILY_REPORT_TO,
		subject: 'Daily Obits',
		html: html

	});
})();
