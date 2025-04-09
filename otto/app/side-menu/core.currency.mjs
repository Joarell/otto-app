//       ╭──────────────────────────────────────────────────────────────╮
//       │ ╭──────────────────────────────────────────────────────────╮ │
//       │ │    INFO: Here you are going to find these functions:     │ │
//       │ │                      currencyName()                      │ │
//       │ │                     populateCoins()                      │ │
//       │ │                   conversionCurrency()                   │ │
//       │ │                    getCurrencyValue()                    │ │
//       │ │                       setValues()                        │ │
//       │ ╰──────────────────────────────────────────────────────────╯ │
//       ╰──────────────────────────────────────────────────────────────╯


function currencyName(list) {
	const fragment = document.createDocumentFragment();

	list.map(name => {
		const option = document.createElement("option");

		option.textContent = name;
		fragment.appendChild(option);
	});
	return(fragment);
};


export async function populateCoins() {
	const coins =		JSON.parse(sessionStorage.getItem("currency"))
	const select1 =		document.getElementById("coin1");
	const select2 =		document.getElementById("coin2");
	const coinNames =	Object.keys(coins);

	if (!coins)
		return("Error");
	select1.appendChild(currencyName(coinNames));
	select2.appendChild(currencyName(coinNames));
	return ;
};


export function conversionCurrency(opt1, opt2, val1, val2) {
	const list =		JSON.parse(sessionStorage.getItem("currency"));
	const COMA =		1000;
	const shiftInput1 =	(Number.parseFloat(val1.value) === list[opt1]);
	const shiftInput2 =	(Number.parseFloat(val2.value) === list[opt2]);

	if (opt1 === opt2)
		return(shiftInput1 ? val2.value: val1.value);
	else if (shiftInput1 && shiftInput2)
		return (~~((list[opt1] * list[opt2]) * COMA) / COMA);
	else if (list[opt1] < list[opt2]) {
		return (shiftInput1 === true ?
			~~(((val2.value / list[opt2]) * list[opt1]) * COMA) / COMA:
			~~(((val1.value * list[opt2]) / list[opt1]) * COMA) / COMA
		);
	}
	return (shiftInput2 === true ?
		~~(((val1.value * list[opt2]) / list[opt1]) * COMA) / COMA:
		~~(((val2.value / list[opt2]) * list[opt1]) * COMA) / COMA
	);
};


export async function getCurrencyValue() {
	const url =	'/api/v1/currencies';
	const getCurrency =	await fetch(url, { method: "GET", })
		.then(async values =>  await values.json())
		.catch(err => alert(`CurrencyError: ${err}!`));
	const { rates } =	getCurrency.response;
	const storage =		globalThis.sessionStorage;

	return(rates && storage.setItem("currency", JSON.stringify(rates)));
};


export function setValues (coin, place) {
	const currency = JSON.parse(sessionStorage.getItem("currency"));

	if (!currency)
		return(false);
	place.value = currency[coin];
};

