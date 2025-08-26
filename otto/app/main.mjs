import * as main from './front-modules/start.front.mjs'; import * as accordion from './side-menu/menu.currency.conversion.mjs'; import * as unit from './side-menu/menu.units.mjs';
import { crate, clearAll, setUnit } from './front-modules/checkout.mjs';
import { copyButton1, copyButton2 } from './panels/clip.board.caller.mjs';
import { createIDB } from './front-modules/link.storage.mjs';
import { switchMode } from './front-modules/mode.color.mjs';
import { accordionController, closeMenu } from './side-menu/interactive.menu.mjs';
import { searchEstimate } from './side-menu/search.menu.mjs';
import { changeCrateDisplay, openDisplay } from './plotter/layer.controller.mjs';
import { layersNumber, skipLayer } from './plotter/select.menu.mjs';
import { logout } from './front-modules/logout.mjs';
import { installer } from './installation.handler.mjs';


globalThis.onkeydown = (push) => {
	const task1 = ((push.key === "Enter") && (push.ctrlKey === true));
	const task2 = ((push.ctrlKey === true) && (push.key === "V"));
	const task3 = push.key === "Escape";

	task1 ? crate() : false;
	task2 ? openDisplay() : false;
	task3 ? closeMenu() : false;
	push.stopImmediatePropagation();
};


globalThis.onafterprint = () => {
	const { shadowRoot } =	document.querySelector('.update-materials');
	const area =		 	shadowRoot.querySelectorAll('[aria-hidden]');

	[...area].map(node => node.ariaHidden = 'false');
};


globalThis.onbeforeprint = () => {
	const { shadowRoot } =	document.querySelector('.update-materials');
	const area =		 	shadowRoot.querySelectorAll('[aria-hidden]');

	[...area].map(node => node.ariaHidden = 'false');
};


globalThis.document.getElementById('main-app')
	.addEventListener("click", (element => {
	const up =		document.querySelector('.materials');
	const down =	document.querySelector('.update-materials');
	let { id, className, attributes } = element.target;

	{
		const { shadowRoot } =	up;
		const shadow =			shadowRoot.querySelector('.upPane');
		shadow?.addEventListener('click', (e) => {
			const { id, className, tagName } = e.target;
			const composeEvent = new CustomEvent('open-crate', {
				bubbles: true,
				composed: true,
				detail: { id, className, tagName },
			});
			shadow.dispatchEvent(composeEvent);
		}, true);
	};
	{
		const { shadowRoot } =	down;
		const shadow =			shadowRoot.querySelector('.data-update');
		shadow?.addEventListener('click', (e) => {
			const { id, className } = e.target;
			const composeEvent = new CustomEvent('update-materials-info', {
				bubbles: true,
				composed: true,
				detail: { id, className },
			});
			shadow.dispatchEvent(composeEvent);
			e.stopImmediatePropagation();
		});

	};
	attributes.content === 'crates' ? className = 'crates': 0;
	switch (!id ? id = className: id) {
		case "body-app" :
			accordionController(element);
			break;
		case "buttonInstall":
			installer();
			break;
		case "add-btn":
			main.catchWork();
			break;
		case "remove-btn":
			main.catchRemove();
			break;
		case "clear-btn":
			clearAll();
			break;
		case "crate-btn":
			crate();
			break;
		case "crate_btn":
			crate();
			break;
		case "copy-pane1":
			copyButton1();
			break;
		case "copy-pane2":
			copyButton2();
			break;
		case "logout":
			logout();
			break;
		case "logout-btn":
			logout();
			break;
		case "seek-btn":
			accordionController(element);
			break;
		case "search-header":
			accordionController(element);
			break;
		case "exchange-header":
			accordion.coins();
			accordion.exchangeHeader();
			accordionController(element);
			break;
		case "units-header":
			accordionController(element);
			break;
		case "button-seek":
			accordionController(element);
			break;
		case "search-btn":
			accordionController(element);
			break;
		case "ex-btn":
			accordion.coins();
			accordionController(element);
			break;
		case "exchange-btn":
			accordion.coins();
			accordionController(element);
			break;
		case "unit-btn":
			accordionController(element);
			break;
		case "units-btn":
			accordionController(element);
			break;
		case "fetch-btn":
			searchEstimate();
			break;
		case "crate-layers":
			openDisplay();
			break;
		case "layer-crate":
			openDisplay();
			break;
		case "previous":
			skipLayer(element);
			break;
		case "layer-prev":
			skipLayer(element);
			break;
		case "next":
			skipLayer(element);
			break;
		case "layer-next":
			skipLayer(element);
			break;
		case 'settings-content':
			className !== 'update-materials' && className !== 'new-material' ? up.setAttribute('content', 'settings-content'): 0
			break;
		case 'packages':
			className !== 'update-materials' && className !== 'select-materials' ? up.setAttribute('content', 'packages'): 0;
			break;
		case 'select-materials':
			className !== 'update-materials'&& className !== 'select-materials' ? up.setAttribute('content', 'select-materials'): 0;
			break;
		case 'materials':
			className !== 'update-materials' && className !== 'select-materials' ? up.setAttribute('content', 'confirm-save'): 0;
			break;
		case 'report':
			up.setAttribute('name', 'packages');
			break;
		case 'report':
			up.setAttribute('name', 'packages');
			break;
		case 'pack-opts':
			up.setAttribute('name', 'works-packed');
			break;
		case 'works-packed':
			up.setAttribute('name', 'works-packed');
			break;
		case 'reset-sizes':
			up.setAttribute('name', 'reset-sizes');
			break;
		case 'reset-szs':
			up.setAttribute('name', 'reset-szs');
			break;
		case 'adding-material':
			up.setAttribute('name', 'adding-material');
			break;
		case 'add__new__field':
			up.setAttribute('name', 'add__new__field');
			break;
		case 'cancel-remove':
			up.setAttribute('name', 'cancel-remove');
			break;
		case 'new-material':
			up.setAttribute('name', 'new-material');
			break;
		case 'confirm-save':
			up.setAttribute('name', 'confirm-save');
			break;
		case 'printer-icon':
			globalThis.print();
			break;
		case 'printer-btn':
			globalThis.print();
			break;
		case 'printer-svg':
			globalThis.print();
			break;
		case 'printer':
			globalThis.print();
			break;
	};
}), true);


globalThis.document.getElementById('main-app')
	.addEventListener("change", (element => {

	// console.log(element.target.id);
	element.preventDefault();
	switch (element.target.id) {
		case "input_estimate":
			createIDB();
			break;
		case "in":
			setUnit();
			break;
		case "cm":
			setUnit();
			break;
		case "dark-mode":
			switchMode('dark');
			break;
		case "light-mode":
			switchMode('light');
			break;
		case "coin1":
			accordion.coinInputOne();
			break;
		case "coin2":
			accordion.coinInputTwo();
			break;
		case "units1":
			unit.setUnitOne();
			break;
		case "units2":
			unit.setUnitTwo();
			break;
		case "selected-crate":
			layersNumber();
			changeCrateDisplay();
			break;
		default:
	};
}), true);


globalThis.document.getElementById('main-app')
	.addEventListener("input", (element => {
	let { id, className } = element.target;

	switch (!id ? id = className: id) {
		case "coin1-input":
			accordion.getInputOne();
			break;
		case "coin2-input":
			accordion.getInputTwo();
			break;
		case "input-unit1":
			unit.getUnitOne();
			break;
		case "input-unit2":
			unit.getUnitTwo();
			break;
		default:
	};
}), true);


globalThis.onsubmit = (event) => {
	event.preventDefault();
};


globalThis.document.getElementById('main-app')
	.addEventListener('open-crate', (e) => {
	const { id, className, tagName } =	e.detail;
	const up =	document.querySelector('.materials');

	tagName === 'A' ? up.setAttribute('content', `${id}-${className}`): 0;
}, true);


globalThis.document.getElementById('main-app')
	.addEventListener('update-materials-info', (e) => {
	const { id } =	e.detail;
	const down =	document.querySelector('.update-materials');

	e.stopImmediatePropagation();
	id === 'update-info' ? down.setAttribute('name', 'update'): 0;
}, true);


globalThis.document.getElementById('estimate_getter')
	.addEventListener('keypress', (event) => {

	//const BUTTON = globalThis.document.getElementById('fetch-btn');
	event.key === 'Enter' ? searchEstimate() : false;
});


globalThis.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault();
	console.log('👍', 'beforeinstallprompt', event);
	globalThis.deferredPrompt = event;
});
