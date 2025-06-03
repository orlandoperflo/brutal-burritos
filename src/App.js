import React, { useState, useEffect, useCallback, useRef } from 'react';
// Removed all Firebase imports
import { ChevronLeft, ShoppingCart, Star, X, PlusCircle, MinusCircle, Trash2,ChevronDown, ChevronUp, Tag, Gift, MapPin, CreditCard, Clock, Home, List, ChevronRight, Settings2, Plus, MessageSquare, Edit3,Flame, User, Phone, Truck, Package, DollarSign, Repeat } from 'lucide-react';

// --- DATA CONSTANTS FIRST ---
const ADEREZOS_OPTIONS_BASE = [
    { label: 'Salsa Verde', value: 'salsa_verde' }, { label: 'Chipotle Dulce', value: 'chipotle_dulce' },
    { label: 'Crema de Ajo (pica)', value: 'crema_ajo_pica' },
];
const CHILES_TATEMADOS_OPTIONS = [
    { label: 'Serrano', value: 'chile_serrano' }, { label: 'Habanero', value: 'chile_habanero' },
];

const CUSTOMIZATION_EXTRAS_OPTIONS = [
    { label: 'Extra Queso Oaxaca', value: 'q_oaxaca_extra_add', priceChange: 20.00 },
    { label: 'Extra Queso Manchego', value: 'q_manchego_extra_add', priceChange: 20.00 },
    { label: 'Extra Guacamole (aguacate hass, cebolla, cilantro, jitomate)', value: 'guacamole_extra_add', priceChange: 30.00 },
    { label: 'Longaniza (porción)', value: 'longaniza_add', priceChange: 20.00 }
];

const COMBINED_EXTRAS_FOR_CASA_BURRITOS = {
    id: 'extras_casa', title: 'Extras (con costo adicional)', type: 'checkbox', obligatorio: false,
    options: CUSTOMIZATION_EXTRAS_OPTIONS.filter(opt => opt.value !== 'longaniza_add')
};

const GENERIC_CUSTOMIZATION_BURRITO = [
    { id: 'aderezos_casa', title: 'Elige tus Aderezos (hasta 3 gratis)', type: 'checkbox', maxChoices: 3, obligatorio: false, options: ADEREZOS_OPTIONS_BASE },
    { id: 'chiles_casa', title: 'Chiles Tatemados (opcional)', type: 'checkbox', obligatorio: false, options: CHILES_TATEMADOS_OPTIONS },
    COMBINED_EXTRAS_FOR_CASA_BURRITOS,
    { id: 'special_instructions', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Sin cebolla, extra picante...', obligatorio: false }
];

// --- THEME COLORS ---
const THEME_BRAND_RED = '#e41313';
const THEME_LIME_GREEN = '#AFFF33';
const THEME_LIME_GREEN_DARKER = '#8ACC1E';


// Removed Firebase Config & Initialization variables and logic
// const firebaseConfigString = process.env.REACT_APP_FIREBASE_CONFIG || '{}';
// let firebaseConfig = {};
// try { firebaseConfig = JSON.parse(firebaseConfigString); } catch (e) { console.error("Error parsing Firebase config:", e); }
// let app; let auth; let db;
// if (firebaseConfig && firebaseConfig.apiKey) {
//       try {
//           app = initializeApp(firebaseConfig);
//           auth = getAuth(app);
//           db = getFirestore(app);
//       } catch (e) {
//           console.error("Error initializing Firebase:", e);
//           auth = { currentUser: null, onAuthStateChanged: () => () => {}, signInAnonymously: async () => ({ user: { uid: 'anon-user-' + crypto.randomUUID() } }) };
//           db = { collection: () => ({ onSnapshot: () => () => {}, doc: () => ({ get: async () => ({ exists: () => false, data: () => null }) }) }) };
//       }
// } else {
//       console.warn("Firebase config not found. App will run with limited functionality.");
//       auth = { currentUser: null, onAuthStateChanged: () => () => {}, signInAnonymously: async () => ({ user: { uid: 'anon-user-' + crypto.randomUUID() } }) };
//       db = { collection: () => ({ onSnapshot: () => () => {}, doc: () => ({ get: async () => ({ exists: () => false, data: () => null }) }) }) };
// }

// appId is now just a constant, no longer related to Firebase paths
const appId = 'brutal-burritos-app';


const MOCK_PRODUCTS = [
    { id: 'burrito_casa', name: 'Burrito de la Casa', price: 200.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Burrito+Casa`, category: 'Burritos de la Casa', description: 'Arrachera, queso manchego, arroz, frijoles refritos, guacamole y salsa verde. Incluye ensalada.', customizable: true, customizationOptions: GENERIC_CUSTOMIZATION_BURRITO },
    { id: 'burrito_chipotle', name: 'Burrito Chipotle', price: 180.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Burrito+Chipotle`, category: 'Burritos de la Casa', description: 'Pollo, arroz, frijoles refritos con chipotle y longaniza, guacamole y chipotle dulce. Incluye ensalada.', customizable: true, customizationOptions: GENERIC_CUSTOMIZATION_BURRITO },
    { id: 'burrito_alambre', name: 'Burrito Alambre', price: 190.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Burrito+Alambre`, category: 'Burritos de la Casa', description: 'Res, queso oaxaca, arroz, frijoles refritos, pimientos, cebolla acitronada, guacamole y salsa verde. Incluye ensalada.', customizable: true, customizationOptions: GENERIC_CUSTOMIZATION_BURRITO },
    { id: 'burrito_kid', name: 'Burrito Kid', price: 95.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Burrito+Kid`, category: 'Burritos de la Casa', description: 'Tortilla más pequeña, proteína a elegir, arroz, frijoles refritos y aderezos. Incluye ensalada.', customizable: true,
        customizationOptions: [
            { id: 'proteina_kid', title: 'Elige Proteína (Kid)', type: 'radio', obligatorio: false, options: [{ label: 'Pollo', value: 'pollo_kid' }, { label: 'Res', value: 'res_kid' }] },
            { id: 'aderezo_kid', title: 'Elige Aderezo (Kid)', type: 'radio', obligatorio: false, options: [{label: 'Ninguno', value: 'ninguno_kid'}, ...ADEREZOS_OPTIONS_BASE.slice(0,2)] },
            { id: 'special_instructions_kid', title: 'Instrucciones Especiales (Kid)', type: 'textarea', placeholder: 'Ej: Sin picante...', obligatorio: false }
        ]
    },
    { id: 'arma_tu_burrito', name: 'Arma tu Burrito', price: 0, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Arma+Tu+Burrito`, category: 'Arma tu Burrito', description: '¡Escoge lo que se te antoje! Crea tu combinación perfecta.', customizable: true,
        customizationOptions: [
            { id: 'proteina_arma', title: '1. Elige tu Proteína', type: 'radio', obligatorio: false, options: [ { label: 'Pollo', value: 'pollo_arma', priceSet: 150.00 }, { label: 'Res', value: 'res_arma', priceSet: 160.00 }, { label: 'Arrachera', value: 'arrachera_arma', priceSet: 170.00 } ] },
            { id: 'arroz_arma', title: '2. Arroz', type: 'radio', obligatorio: false, options: [{ label: 'Arroz Blanco', value: 'arroz_blanco' }, {label: 'Sin Arroz', value: 'sin_arroz'}] , isDefault: 'arroz_blanco'},
            { id: 'frijoles_arma', title: '3. Frijoles', type: 'radio', obligatorio: false, options: [{ label: 'Frijoles Refritos', value: 'frijoles_refritos' }, { label: 'Frijoles Negros', value: 'frijoles_negros' }, {label: 'Sin Frijoles', value: 'sin_frijoles'}], isDefault: 'frijoles_refritos'},
            { id: 'queso_arma', title: '4. Elige tu Queso (incluido)', type: 'radio', obligatorio: false, options: [{ label: 'Queso Oaxaca', value: 'queso_oaxaca_arma'}, { label: 'Queso Manchego', value: 'queso_manchego_arma' }, {label: 'Sin Queso', value: 'sin_queso_arma'}]},
            { id: 'extras_arma_tu_burrito_combined', title: '5. Extras Brutales (con costo adicional)', type: 'checkbox', obligatorio: false, options: CUSTOMIZATION_EXTRAS_OPTIONS },
            { id: 'aderezos_arma', title: '6. Aderezos (elige hasta 2)', type: 'checkbox', options: ADEREZOS_OPTIONS_BASE, maxChoices: 2, obligatorio: false },
            { id: 'chiles_tatemados_arma', title: '7. Chiles Tatemados (opcional)', type: 'checkbox', options: CHILES_TATEMADOS_OPTIONS, obligatorio: false },
            { id: 'special_instructions_arma', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Cualquier detalle adicional...', obligatorio: false }
        ]
    },
    { id: 'combo_familiar', name: 'Combo Familiar', price: 650.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Combo+Familiar`, category: 'Combos', description: '2 Burritos de la casa, 2 Burritos kids, 2 Agua fresca del dia 1L, 4 Ensaladas. Cambia ensaladas por papas fritas (+$20).', customizable: true,
        customizationOptions: [ { id: 'cambio_ensalada_familiar', title: 'Guarnición Ensaladas', type: 'radio', obligatorio: false, options: [{label: '4 Ensaladas (Incluido)', value: 'ensaladas'}, {label: '4 Papas Fritas (+$20)', value: 'papas_fritas', priceChange: 20.00}]}, { id: 'special_instructions_familiar', title: 'Instrucciones Especiales para el Combo', type: 'textarea', placeholder: 'Preferencias generales...', obligatorio: false } ]
    },
    { id: 'combo_duo', name: 'Combo Duo', price: 390.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Combo+Duo`, category: 'Combos', description: '2 Burritos originales de bistec con guacamole y queso, Agua fresca del dia 1L, 2 Ensaladas. Cambia ensaladas por papas fritas (+$10).', customizable: true,
        customizationOptions: [ { id: 'cambio_ensalada_duo', title: 'Guarnición Ensaladas', type: 'radio', obligatorio: false, options: [{label: '2 Ensaladas (Incluido)', value: 'ensaladas_duo'}, {label: '2 Papas Fritas (+$10)', value: 'papas_fritas_duo', priceChange: 10.00}]}, { id: 'special_instructions_duo', title: 'Instrucciones Especiales para el Combo', type: 'textarea', placeholder: 'Preferencias generales...', obligatorio: false } ]
    },
    { id: 'combo_original', name: 'Combo Original', price: 215.00, imageUrl: `https://placehold.co/300x200/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=Combo+Original`, category: 'Combos', description: '1 Burrito original de arrachera con guacamole y queso, Agua fresca del dia 500ml, 1 Ensalada.', customizable: true, customizationOptions: [ { id: 'special_instructions_original', title: 'Instrucciones Especiales para el Combo', type: 'textarea', placeholder: 'Preferencias generales...', obligatorio: false } ]
    },
    { id: 'bebida_agua_1l', name: 'Agua del Día 1L', price: 45.00, imageUrl: `https://placehold.co/300x200/A1887F/FFFFFF?text=Agua+1L`, category: 'Bebidas', description: 'Agua fresca del día, tamaño 1 litro.', customizable: true, customizationOptions: [{ id: 'special_instructions_bebida', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Con poco hielo...', obligatorio: false }] },
    { id: 'bebida_agua_500ml', name: 'Agua del Día 500ml', price: 25.00, imageUrl: `https://placehold.co/300x200/A1887F/FFFFFF?text=Agua+500ml`, category: 'Bebidas', description: 'Agua fresca del día, tamaño 500 mililitros.', customizable: true, customizationOptions: [{ id: 'special_instructions_bebida', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Con poco hielo...', obligatorio: false }] },
    { id: 'comp_papas', name: 'Papas Fritas', price: 30.00, imageUrl: `https://placehold.co/300x200/D7CCC8/000000?text=Papas+Fritas`, category: 'Complementos', description: 'Crujientes papas fritas.', customizable: true, customizationOptions: [{ id: 'special_instructions_comp', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Bien doradas...', obligatorio: false }] },
    { id: 'comp_ensalada', name: 'Ensalada', price: 20.00, imageUrl: `https://placehold.co/300x200/D7CCC8/000000?text=Ensalada`, category: 'Complementos', description: 'Lechuga y jitomate.', customizable: true, customizationOptions: [{ id: 'special_instructions_comp', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Sin jitomate...', obligatorio: false }] },
    { id: 'comp_verduras', name: 'Verduras al Vapor', price: 30.00, imageUrl: `https://placehold.co/300x200/D7CCC8/000000?text=Verduras`, category: 'Complementos', description: 'Zanahoria, calabaza italiana y brócoli.', customizable: true, customizationOptions: [{ id: 'special_instructions_comp', title: 'Instrucciones Especiales', type: 'textarea', placeholder: 'Ej: Bien cocidas...', obligatorio: false }] },
    ...ADEREZOS_OPTIONS_BASE.map(aderezo => ({ id: `aderezo_extra_${aderezo.value}`, name: aderezo.label, price: 10.00, imageUrl: `https://placehold.co/150x150/BCAAA4/000000?text=${aderezo.label.substring(0,10)}`, category: 'Extras', description: `Porción extra de aderezo ${aderezo.label}.`, customizable: false }))
];

const MOCK_COMPLEMENTARY_PRODUCTS = [
    MOCK_PRODUCTS.find(p => p.id === 'comp_papas'), MOCK_PRODUCTS.find(p => p.id === 'comp_ensalada'),
    MOCK_PRODUCTS.find(p => p.id === 'comp_verduras'), MOCK_PRODUCTS.find(p => p.id === 'bebida_agua_1l'),
    MOCK_PRODUCTS.find(p => p.id === 'bebida_agua_500ml'),
].filter(Boolean);

const DISPLAY_CATEGORIES = ['Populares', 'Burritos de la Casa', 'Arma tu Burrito', 'Combos', 'Bebidas', 'Complementos', 'Extras'];
const POPULARES_SECTION_ORDER = ['Burritos de la Casa', 'Combos', 'Arma tu Burrito', 'Complementos', 'Extras', 'Bebidas'];

const formatPrice = (price) => price ? `$${price.toFixed(2)}` : '$0.00';

// Removed setupProductsInFirestore as it interacts with Firestore
// const setupProductsInFirestore = async () => {
//       if (!db || !(firebaseConfig && firebaseConfig.apiKey)) return;
//       const productsRef = collection(db, `/artifacts/${appId}/public/data/products`);
//       try {
//           if (MOCK_PRODUCTS.length === 0) { console.log("MOCK_PRODUCTS is empty, skipping setup."); return; }
//           const armaTuBurritoRef = doc(productsRef, 'arma_tu_burrito'); const armaTuBurritoSnap = await getDoc(armaTuBurritoRef);
//           const burritoCasaRef = doc(productsRef, 'burrito_casa'); const burritoCasaSnap = await getDoc(burritoCasaRef);
//           const currentProductCountSnap = await getDocs(productsRef);
//           let needsUpdate = false;
//           if (!armaTuBurritoSnap.exists() || !armaTuBurritoSnap.data().customizationOptions || !armaTuBurritoSnap.data().customizationOptions.find(g => g.id === 'extras_arma_tu_burrito_combined') || !armaTuBurritoSnap.data().customizationOptions.find(g => g.id === 'queso_arma' && g.options.every(opt => !opt.priceChange))) { needsUpdate = true; }
//           if (burritoCasaSnap.exists()) { const casaData = burritoCasaSnap.data(); if (!casaData.customizationOptions || !casaData.customizationOptions.find(opt => opt.id === 'aderezos_casa' && opt.maxChoices === 3) || !casaData.customizationOptions.find(opt => opt.id === 'chiles_casa') || !casaData.customizationOptions.find(opt => opt.id === 'extras_casa')) { needsUpdate = true; }
//           } else { needsUpdate = true; }
//           if (currentProductCountSnap.size !== MOCK_PRODUCTS.length) { needsUpdate = true; console.log(`Product count mismatch. Firestore: ${currentProductCountSnap.size}, Mock: ${MOCK_PRODUCTS.length}`); }
//           if (!needsUpdate) { console.log("Brutal Burritos products (with refined customization logic) seem to be up-to-date in Firestore."); return; }
//           console.log("Setting up/Updating Brutal Burritos products in Firestore due to structural changes or count mismatch...");
//           const batch = writeBatch(db);
//           MOCK_PRODUCTS.forEach(product => { const docRef = doc(productsRef, product.id); batch.set(docRef, product); });
//           await batch.commit();
//           console.log("Brutal Burritos products added/updated in Firestore.");
// };

let currentProductForCustomizationState = null;

const Header = ({ currentPage, setCurrentPage, cartItemCount, isCustomizationPanelOpen, productBeingCustomizedName }) => {
    const isHomePage = currentPage === 'home' && !isCustomizationPanelOpen;
    const getTitle = () => {
        if (isCustomizationPanelOpen && productBeingCustomizedName) { return `Personalizar ${productBeingCustomizedName.substring(0,15)}${productBeingCustomizedName.length > 15 ? '...' : ''}`; }
        if (isCustomizationPanelOpen) return '';
        if (currentPage === 'home') return 'Brutal Burritos';
        if (currentPage === 'cart') return 'Brutal Burritos';
        if (currentPage === 'checkout') return 'Haz tu Pedido';
        return 'Brutal Burritos';
    };
    const showMainHeaderBackButton = !isCustomizationPanelOpen && currentPage !== 'home';
    return (
        <header className={`bg-white shadow-md sticky top-0 z-50 p-4 flex items-center justify-between ${isCustomizationPanelOpen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex items-center">
                {showMainHeaderBackButton ? ( <button onClick={() => setCurrentPage('home')} className="mr-2 text-gray-700 hover:text-red-600" style={{color: THEME_BRAND_RED}}> <ChevronLeft size={24} /> </button> ) : <div className="w-6 h-6"></div>}
                <h1 className="text-xl font-bold text-gray-800 truncate max-w-[calc(100vw-150px)] flex items-center"> <Flame size={24} className="mr-2" style={{color: THEME_BRAND_RED}} /> {getTitle()} </h1>
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('cart')} className="relative text-gray-700 hover:text-red-600"> <ShoppingCart size={24} />
                    {cartItemCount > 0 && ( <span className="absolute -top-2 -right-2 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center" style={{backgroundColor: THEME_LIME_GREEN}}> {cartItemCount} </span> )}
                </button>
            </div>
        </header>
    );
};

const ProductCard = ({ product, onAddToCart, onCustomize }) => {
    const discount = product.originalPrice && product.price < product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const handleActionClick = (e) => { e.stopPropagation(); onCustomize(product); };
    return ( <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 relative flex flex-col justify-between"> <div className="relative"> <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x200/757575/FFFFFF?text=Sin+Imagen`; }}/> {discount > 0 && ( <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded"> {discount}% OFF </div> )} <button onClick={handleActionClick} aria-label={`Personalizar ${product.name}`} className="absolute top-2 right-2 text-black rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-transform hover:scale-110" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER }}> <Plus size={20} strokeWidth={3} /> </button> </div> <div className="p-4 flex-grow"> <h3 className="text-md font-semibold text-gray-800 mb-1 truncate">{product.name}</h3> <p className="text-xs text-gray-600 mb-2">{product.description}</p> </div> <div className="p-4 pt-0"> <div className="flex items-baseline"> <span className="text-xl font-bold text-gray-800">{product.price > 0 ? formatPrice(product.price) : (product.id === 'arma_tu_burrito' ? `Desde ${formatPrice(150)}` : "Precio Varía")}</span> {product.originalPrice && (<span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>)} </div> </div> </div> );
};

const HomePage = ({ products, setCurrentPage, onAddToCart, onCustomize, userId, deliveryMode, setDeliveryMode }) => {
    const [selectedCategory, setSelectedCategory] = useState(DISPLAY_CATEGORIES[0]);
    const pickupAddressPart1 = "Brutal Burritos, Calle 69E #224,";
    const pickupAddressPart2 = "Yucalpetén, Mérida, Yucatán";
    const fullPickupAddress = `${pickupAddressPart1} ${pickupAddressPart2}`;
    const pickupAddressLink = `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(fullPickupAddress)}`;

    return (
        <div className="pb-20">
            <div className="p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                    {/* This div contains the h2 and the delivery/pickup info */}
                    <div className="flex flex-col items-center w-full"> {/* Added flex-col items-center and w-full */}
                        <h2 className="text-2xl font-bold" style={{color: THEME_BRAND_RED}}>Brutal Burritos</h2>
                        {deliveryMode === 'delivery' && (
                            <div className="flex flex-col sm:flex-row sm:space-x-4 items-start sm:items-center text-sm text-gray-600 mt-1 h-[40px] justify-center"> {/* Added h-[40px] and justify-center */}
                                <div className="flex items-center mb-1 sm:mb-0"> {/* Entrega block */}
                                    <Clock size={16} className="mr-1" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Entrega:</span>
                                        <span className="font-semibold text-gray-700">25-40 min</span>
                                    </div>
                                </div>
                                <span className="hidden sm:inline-block mx-2 text-gray-300">|</span> {/* Separator for desktop */}
                                <div className="flex items-center"> {/* Envío block */}
                                    {/* Removed Truck icon */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Envío:</span>
                                        <span className="font-semibold" style={{color: THEME_LIME_GREEN_DARKER}}>$40.00</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {deliveryMode === 'pickup' && (
                            <a href={pickupAddressLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 mt-1 flex items-start hover:underline h-[40px] justify-center" style={{color: THEME_BRAND_RED}}> {/* Added h-[40px] and justify-center */}
                                <MapPin size={16} className="mr-1 flex-shrink-0 mt-0.5" /> {/* Adjust margin-top for alignment */}
                                <div className="flex flex-col">
                                    <span>{pickupAddressPart1}</span>
                                    <span>{pickupAddressPart2}</span>
                                </div>
                            </a>
                        )}
                    </div>
                </div>
                <div className="bg-gray-100 rounded-full p-1 flex mb-4 shadow-inner">
                    <button
                        onClick={() => setDeliveryMode('delivery')}
                        className={`w-1/2 py-2.5 px-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out ${deliveryMode === 'delivery' ? 'text-black shadow-md' : 'text-gray-500'}`}
                        style={deliveryMode === 'delivery' ? {backgroundColor: THEME_LIME_GREEN} : {}}
                    >
                        Domicilio
                    </button>
                    <button
                        onClick={() => setDeliveryMode('pickup')}
                        className={`w-1/2 py-2.5 px-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out ${deliveryMode === 'pickup' ? 'text-black shadow-md' : 'text-gray-500'}`}
                        style={deliveryMode === 'pickup' ? {backgroundColor: THEME_LIME_GREEN} : {}}
                    >
                        Recoger en tienda
                    </button>
                </div>
                <div className="p-3 rounded-md mb-4" style={{backgroundColor: `${THEME_BRAND_RED}20`, borderLeft: `4px solid ${THEME_BRAND_RED}`}}> <p className="font-bold" style={{color: THEME_BRAND_RED}}>¡Ofertas Brutales!</p> <p className="text-sm" style={{color: `${THEME_BRAND_RED}E6`}}>Descubre nuestros combos y ahorra.</p> </div>
            </div>
            <div className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="flex space-x-1 overflow-x-auto p-3 scrollbar-hide">
                    {DISPLAY_CATEGORIES.map(category => ( <button key={category} onClick={() => setSelectedCategory(category)} className={`py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? 'text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} style={selectedCategory === category ? {backgroundColor: THEME_LIME_GREEN, color: 'black'} : {}}> {category} </button> ))}
                </div>
            </div>

            {selectedCategory === 'Populares' ? (
                POPULARES_SECTION_ORDER.map(sectionCategory => {
                    const sectionProducts = products.filter(p => p.category === sectionCategory);
                    if (sectionProducts.length === 0) return null;
                    return (
                        <div key={sectionCategory} className="pt-4">
                            <h3 className="text-xl font-semibold my-2 px-4 text-gray-800">{sectionCategory}</h3>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sectionProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onCustomize={onCustomize} />
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.filter(p => p.category === selectedCategory).length > 0 ? (
                        products.filter(p => p.category === selectedCategory).map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onCustomize={onCustomize} />
                        ))
                    ) : ( <p className="text-gray-600 col-span-full text-center py-8">No hay productos en esta categoría.</p> )}
                </div>
            )}
        </div>
    );
};

const CartItemCard = ({ item, productDetail, onUpdateQuantity, onRemoveItem, onEditItem }) => {
    const [customizationsOpen, setCustomizationsOpen] = useState(false);
    const displayName = item.name || productDetail?.name;
    const displayPrice = item.price || productDetail?.price || 0;
    const displayImageUrl = item.imageUrl || productDetail?.imageUrl;
    const originalPrice = item.originalPrice || productDetail?.originalPrice;
    const discountPercentage = originalPrice && displayPrice < originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
    const customizationEntries = Object.entries(item.customizations || {});

    const handleDecreaseQuantity = () => {
        if (item.quantity === 1) {
            onRemoveItem(item.id);
        } else {
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    return (
    <div className="bg-white p-3 rounded-lg shadow mb-3">
        <div className="flex items-start justify-between">
            <div className="flex items-start">
                <div className="relative">
                    <img src={displayImageUrl} alt={displayName} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md mr-3" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/80x80/757575/FFFFFF?text=N/A`; }}/>
                    <button
                        onClick={() => onEditItem(productDetail, item)}
                        className="absolute -top-1 -left-1 bg-gray-200 text-gray-700 rounded-full p-1 shadow-sm hover:bg-gray-300"
                        aria-label="Editar producto"
                    >
                        <Edit3 size={12} strokeWidth={2}/>
                    </button>
                </div>
                <div className="flex-grow">
                    <h3 className="text-sm sm:text-md font-semibold text-gray-800">{displayName}</h3>
                    <div className="flex items-center mt-1">
                        <span className="text-sm sm:text-md font-bold text-gray-800">{formatPrice(displayPrice)}</span>
                        {originalPrice && (<span className="text-xs text-gray-500 line-through ml-2">{formatPrice(originalPrice)}</span>)}
                    </div>
                    {discountPercentage > 0 && (<p className="text-xs font-semibold" style={{color: THEME_BRAND_RED}}>-{discountPercentage}%</p>)}
                    {customizationEntries.length > 0 && (
                        <button onClick={() => setCustomizationsOpen(!customizationsOpen)} className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center">
                            {customizationEntries.map(([key, value], index) => index < 2 ? `${value}` : '').join(', ').substring(0,30)}
                            {customizationEntries.map(([key, value], index) => index < 2 ? `${value}` : '').join(', ').length > 30 || customizationEntries.length > 2 ? '...' : ''}
                            {customizationEntries.length > 0 && (customizationsOpen ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center ml-2">
                <button onClick={handleDecreaseQuantity} className="text-gray-700 p-1 hover:bg-gray-100 rounded-full">
                    {item.quantity === 1 ? <Trash2 size={18} className="text-black" strokeWidth={1.5}/> : <MinusCircle size={22} className="text-gray-600"/>}
                </button>
                <span className="mx-2 text-md font-semibold w-6 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full"><PlusCircle size={22} /></button>
            </div>
        </div>
        {customizationsOpen && customizationEntries.length > 0 && ( <div className="mt-2 pt-2 border-t border-gray-100"> <p className="text-xs font-semibold text-gray-600 mb-1">Personalizaciones:</p> {customizationEntries.map(([key, value]) => (<p key={key} className="text-xs text-gray-500 ml-2">- {key}: {value}</p>))} </div> )}
    </div> );
};
const ComplementaryProductCard = ({ product, onAddToCart }) => {
    return ( <div className="bg-white rounded-lg shadow-md overflow-hidden w-36 flex-shrink-0 mr-3 relative"> <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/150x150/757575/FFFFFF?text=N/A`; }}/> <div className="p-2"> <h4 className="text-xs font-semibold text-gray-700 truncate">{product.name}</h4> {product.size && <p className="text-xs text-gray-500">{product.size}</p>} <p className="text-sm font-bold text-gray-800 mt-1">{formatPrice(product.price)}</p> </div> <button onClick={() => onAddToCart(product, 1, {}, true)} className="absolute top-1 right-1 text-black rounded-full p-1.5 shadow-md transition-colors" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}} aria-label={`Agregar ${product.name}`}> <Plus size={16} strokeWidth={3}/> </button> </div> );
};

const CartPage = ({ cartItems, products, onUpdateQuantity, onRemoveItem, setCurrentPage, onClearCart, onAddToCart, onEditItem }) => {
    const getProductDetails = (productId) => products.find(p => p.id === productId); const subtotal = cartItems.reduce((sum, item) => { const product = getProductDetails(item.productId); return sum + ((item.price || (product ? product.price : 0)) * item.quantity); }, 0);

    if (cartItems.length === 0) { return ( <div className="p-4 text-center min-h-[calc(100vh-150px)] flex flex-col justify-center items-center bg-gray-50"> <ShoppingCart size={60} className="mx-auto text-gray-400 mb-6" /> <p className="text-gray-700 text-2xl font-semibold mb-3">Tu canasta está vacía</p> <p className="text-gray-500 mb-8">¡Añade algo BRUTAL a tu pedido!</p> <button onClick={() => setCurrentPage('home')} className="text-black py-3 px-8 rounded-lg transition-colors text-lg font-medium shadow-md" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}}> Ver Menú </button> </div> ); }
    return ( <div className="bg-gray-50 min-h-screen"> <div className="p-4 pb-48"> {cartItems.map(item => ( <CartItemCard key={item.id} item={item} productDetail={getProductDetails(item.productId)} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} onEditItem={onEditItem} /> ))} {cartItems.length > 0 && ( <button onClick={onClearCart} className="w-full mt-4 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center" style={{color: THEME_BRAND_RED, border: 'none', backgroundColor: 'transparent'}}> <Trash2 size={16} className="mr-2" /> Vaciar canasta </button> )} <div className="mt-8"> <h3 className="text-lg font-semibold text-gray-800 mb-1">Complementa tu pedido</h3> <p className="text-sm text-gray-500 mb-4">Otros Brutales también agregaron:</p> <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> {MOCK_COMPLEMENTARY_PRODUCTS.map(compProduct => ( <ComplementaryProductCard key={compProduct.id} product={compProduct} onAddToCart={onAddToCart} /> ))} </div> </div> </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-top-strong max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <span className="text-2xl font-bold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <button onClick={() => setCurrentPage('checkout')} className="text-black py-3 px-6 rounded-full transition-colors font-semibold text-md shadow-md" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}}> Ir a pagar </button>
            </div>
        </div>
    </div> );
};
const CheckoutPage = ({ cartItems, products, setCurrentPage, subtotal, initialDeliveryMode }) => {
    const [orderType, setOrderType] = useState(initialDeliveryMode || 'delivery');
    const [streetAndNumber, setStreetAndNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [zipCode, setZipCode] = useState('');

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [showPaymentOptions, setShowPaymentOptions] = useState(true);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [savedCardLastFour, setSavedCardLastFour] = useState('');

    const pickupAddress = "Brutal Burritos, Calle 69E #224, Yucalpetén, Mérida, Yucatán";
    const deliveryFee = orderType === 'delivery' ? 40.00 : 0;
    const total = subtotal + deliveryFee;

    const handleSaveCard = () => {
        if (cardNumber.length >= 13 && cardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/) && cardCvv.length >= 3) {
            console.log("Simulating card save:", { cardNumber: cardNumber.slice(-4), cardExpiry, cardCvv });
            setSavedCardLastFour(cardNumber.slice(-4));
            setPaymentMethod('card_saved');
            setShowPaymentOptions(false);
        } else {
            // Replaced alert() with a console.error for Vercel compatibility
            console.error("Por favor, ingresa datos de tarjeta válidos.");
        }
    };

    const handlePaymentOptionSelect = (method) => {
        if (method === 'card') {
            setPaymentMethod('card_form_active');
        } else {
            setPaymentMethod(method);
        }
        setShowPaymentOptions(false);
    };

    const handleContinueToWhatsApp = () => {
        let orderSummary = "¡Hola Brutal Burritos! esta es mi orden:\n\n";
        orderSummary += `*Cliente:* ${customerName || 'No especificado'}\n`;
        orderSummary += `*Teléfono:* ${customerPhone ? '+52' + customerPhone : 'No especificado'}\n\n`;
        orderSummary += `*Tipo de Orden:* ${orderType === 'delivery' ? 'Entrega a Domicilio' : 'Recoger en Tienda'}\n`;

        if (orderType === 'delivery') {
            orderSummary += `*Dirección de Entrega:*\n`;
            orderSummary += `  Calle y Número: ${streetAndNumber || 'No especificado'}\n`;
            orderSummary += `  Colonia: ${neighborhood || 'No especificado'}\n`;
            orderSummary += `  C.P.: ${zipCode || 'No especificado'}\n\n`;
        } else {
            orderSummary += `*Lugar de Recolección:* ${pickupAddress}\n\n`;
        }

        orderSummary += "*Pedido:*\n";
        cartItems.forEach(item => {
            const product = products.find(p => p.id === item.productId) || item;
            orderSummary += `- ${item.quantity}x ${item.name} (${formatPrice(item.price)})`;
            if (item.customizations && Object.keys(item.customizations).length > 0) {
                orderSummary += " (";
                orderSummary += Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(', ');
                orderSummary += ")";
            }
            orderSummary += "\n";
        });
        orderSummary += "\n";

        let paymentMethodText = 'No especificado';
        if (paymentMethod === 'card_saved') {
            paymentMethodText = `Tarjeta ****${savedCardLastFour}`;
        } else if (paymentMethod === 'cash') {
            paymentMethodText = 'Efectivo';
        } else if (paymentMethod === 'transfer') {
            paymentMethodText = 'Transferencia';
        } else if (paymentMethod === 'card_form_active') {
             paymentMethodText = 'Tarjeta (Pendiente de guardar)';
        }

        orderSummary += `*Método de Pago:* ${paymentMethodText}\n\n`;

        orderSummary += `*Costo de Productos:* ${formatPrice(subtotal)}\n`;
        orderSummary += `*Costo de Envío:* ${formatPrice(deliveryFee)}\n`;
        orderSummary += `*Total a Pagar:* ${formatPrice(total)}\n\n`;
        orderSummary += "¡Gracias!";

        const whatsappNumber = "5219996057107";
        const encodedMessage = encodeURIComponent(orderSummary);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        console.log("Order details:", orderSummary);
    };


    return (
    <div className="p-4 bg-gray-50 min-h-screen pb-48">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Haz tu pedido</h2>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">Información de Contacto</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                    <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tu nombre aquí"
                        className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" // Added text-base
                        style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}} />
                </div>
                <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-600 mb-1">Número de Teléfono</label>
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">+52</span>
                        <input type="tel" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))} placeholder="9991234567"
                            className="w-full p-3 border border-gray-300 rounded-r-md text-base focus:ring-2 focus:border-transparent" // Added text-base
                            style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}}/>
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Tipo de Orden</h3>
            <div className="flex rounded-lg shadow-sm">
                <button onClick={() => setOrderType('delivery')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-l-lg ${orderType === 'delivery' ? 'text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    style={orderType === 'delivery' ? {backgroundColor: THEME_LIME_GREEN, color: 'black'} : {}} > Domicilio </button>
                <button onClick={() => setOrderType('pickup')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-r-lg ${orderType === 'pickup' ? 'text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    style={orderType === 'pickup' ? {backgroundColor: THEME_LIME_GREEN, color: 'black'} : {}} > Recoger </button>
            </div>
        </div>

        {orderType === 'delivery' && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 min-h-[250px] flex flex-col justify-center"> {/* Added flex flex-col justify-center */}
                <h3 className="font-semibold mb-3 text-gray-700">Dirección de Entrega</h3>
                <div className="space-y-4 flex-grow"> {/* Added flex-grow */}
                    <div>
                        <label htmlFor="streetAndNumber" className="block text-sm font-medium text-gray-600 mb-1">Calle y Número</label>
                        <input type="text" id="streetAndNumber" value={streetAndNumber} onChange={(e) => setStreetAndNumber(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" // Added text-base
                            style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}} />
                    </div>
                     <div>
                        <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
                        <input type="text" id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" // Added text-base
                            style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}} />
                    </div>
                     <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-600 mb-1">Código Postal</label>
                        <input type="text" id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" // Added text-base
                            style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}} />
                    </div>
                </div>
            </div>
        )}
        {orderType === 'pickup' && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 min-h-[250px] flex flex-col"> {/* Added min-h and flex-col */}
                <h3 className="font-semibold mb-2 text-gray-700">Dirección de Recolección</h3>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col justify-center flex-grow"> {/* Added flex-col, justify-center, flex-grow */}
                    <p className="text-sm text-gray-700 font-medium">Brutal Burritos</p>
                    <p className="text-sm text-gray-600">Calle 69E #224, Yucalpetén,</p>
                    <p className="text-sm text-gray-600">Mérida, Yucatán</p>
                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(pickupAddress)}`, "_blank")} className="text-sm mt-2 font-medium flex items-center" style={{color: THEME_BRAND_RED}}> <MapPin size={14} className="mr-1"/> Ver en mapa </button>
                </div>
            </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Método de pago</h3>
                {(paymentMethod === 'card_saved' || paymentMethod === 'cash' || paymentMethod === 'transfer') && !showPaymentOptions && (
                    <button onClick={() => { setShowPaymentOptions(true); }} className="text-sm font-medium" style={{color: THEME_BRAND_RED}}>Cambiar</button>
                )}
            </div>

            {showPaymentOptions ? (
                <div className="mt-3 space-y-2">
                    <button onClick={() => handlePaymentOptionSelect('card')}
                                className={`w-full flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'card_form_active' ? 'ring-2' : 'border-gray-300'}`}
                                style={paymentMethod === 'card_form_active' ? {borderColor: THEME_LIME_GREEN, backgroundColor: `${THEME_LIME_GREEN}22`, ringColor: THEME_LIME_GREEN_DARKER} : {}} >
                        <CreditCard size={20} className="mr-2 text-gray-700"/>
                        <span className="text-sm text-gray-700">Tarjeta de Crédito/Débito</span>
                    </button>
                    <button onClick={() => handlePaymentOptionSelect('transfer')}
                                className={`w-full flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'transfer' ? 'ring-2' : 'border-gray-300'}`}
                                style={paymentMethod === 'transfer' ? {borderColor: THEME_LIME_GREEN, backgroundColor: `${THEME_LIME_GREEN}22`, ringColor: THEME_LIME_GREEN_DARKER} : {}} >
                        <Repeat size={20} className="mr-2 text-gray-700"/>
                        <span className="text-sm text-gray-700">Transferencia</span>
                    </button>
                    <button onClick={() => handlePaymentOptionSelect('cash')}
                                className={`w-full flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === 'cash' ? 'ring-2' : 'border-gray-300'}`}
                                style={paymentMethod === 'cash' ? {borderColor: THEME_LIME_GREEN, backgroundColor: `${THEME_LIME_GREEN}22`, ringColor: THEME_LIME_GREEN_DARKER} : {}} >
                        <DollarSign size={20} className="mr-2 text-gray-700"/>
                        <span className="text-sm text-gray-700">Efectivo</span>
                    </button>
                </div>
            ) : paymentMethod === 'card_saved' ? (
                <div className="flex items-center">
                    <CreditCard size={20} className="mr-2 text-gray-600"/>
                    <p className="text-sm text-gray-600">Tarjeta Crédito/Débito ****{savedCardLastFour}</p>
                </div>
            ) : paymentMethod === 'cash' ? (
                <div className="flex items-center">
                    <DollarSign size={20} className="mr-2 text-gray-600" />
                    <p className="text-sm text-gray-600">Efectivo</p>
                </div>
            ) : paymentMethod === 'transfer' ? (
                <div className="flex items-center">
                    <Repeat size={20} className="mr-2 text-gray-600" />
                    <p className="text-sm text-gray-600">Transferencia</p>
                </div>
            ) : paymentMethod === 'card_form_active' ? (
                    <div className="mt-4 space-y-3">
                        <div> <label htmlFor="cardNumber" className="block text-xs font-medium text-gray-600 mb-1">Número de Tarjeta</label> <input type="text" id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0,16))} placeholder="0000 0000 0000 0000" maxLength="16" className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}}/> </div>
                        <div className="flex space-x-3"> <div className="flex-1"> <label htmlFor="cardExpiry" className="block text-xs font-medium text-gray-600 mb-1">Vencimiento (MM/AA)</label> <input type="text" id="cardExpiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substring(0,5))} placeholder="MM/AA" maxLength="5" className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}}/> </div> <div className="flex-1"> <label htmlFor="cardCvv" className="block text-xs font-medium text-gray-600 mb-1">CVV</label> <input type="text" id="cardCvv" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0,4))} placeholder="123" maxLength="4" className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:border-transparent" style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}}/> </div> </div>
                        <button onClick={handleSaveCard} className="w-full text-black py-2.5 px-4 rounded-lg transition-colors font-semibold text-sm shadow-md mt-3" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}}> Guardar Tarjeta </button>
                        <button onClick={() => {setShowPaymentOptions(true); setPaymentMethod('card');}} className="w-full text-sm text-gray-600 hover:text-red-600 mt-2">Cancelar</button>
                    </div>
            ) : null }
             {paymentMethod === 'cash' && !showPaymentOptions && <p className="text-xs text-gray-500 mt-2">Pagarás en efectivo al momento de la entrega o recolección.</p>}
             {paymentMethod === 'transfer' && !showPaymentOptions && <p className="text-xs text-gray-500 mt-2">Se proporcionarán los datos para la transferencia al confirmar.</p>}
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-2 text-gray-700">Resumen del pedido</h3>
            <button onClick={() => setCurrentPage('cart')} className="flex justify-between items-center text-sm text-gray-600 w-full hover:bg-gray-50 p-1 rounded">
                <p>Brutal Burritos ({cartItems.length} Producto{cartItems.length === 1 ? '' : 's'})</p>
                <ChevronRight size={18} />
            </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-24">
            <h3 className="font-semibold mb-3 text-gray-700">Detalles del Cobro</h3>
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                    <span>Costo de productos</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                    <span>Costo de envío</span>
                    <span style={{color: deliveryFee > 0 ? THEME_BRAND_RED : 'inherit'}}>{formatPrice(deliveryFee)}</span>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 hover:underline cursor-pointer">Así funcionan nuestros costos</p>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-top-strong max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">Total a pagar</p>
                    <span className="text-2xl font-bold text-gray-800">{formatPrice(total)}</span>
                </div>
                <button
                    onClick={handleContinueToWhatsApp}
                    className="text-black py-3 px-6 rounded-full transition-colors font-semibold text-md shadow-md"
                    style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}}
                    disabled={!paymentMethod || paymentMethod === 'card_form_active' || (orderType === 'delivery' && (!streetAndNumber || !neighborhood || !zipCode)) || !customerName || !customerPhone}
                >
                    Continuar
                </button>
            </div>
        </div>
    </div>
    );
};

const CustomizationPlaceholderPage = ({ product, onAddToCart, onClose, initialQuantity, initialCustomizations, editingCartItemId }) => {
    const [quantity, setQuantity] = useState(initialQuantity || 1);
    const [selectedCustomizations, setSelectedCustomizations] = useState({});
    const [currentPrice, setCurrentPrice] = useState(product.price);

    const areAllObligatorySectionsCompleted = useCallback(() => {
        if (!product.customizationOptions) return true;
        for (const group of product.customizationOptions) {
            if (group.obligatorio) {
                const selection = selectedCustomizations[group.id];
                if (group.type === 'radio' && !selection) return false;
                if (group.type === 'checkbox') {
                    const currentGroupSelections = selection || {};
                    if (Object.values(currentGroupSelections).every(v => !v)) return false;
                }
                if (group.type === 'textarea' && (!selection || selection.trim() === '')) return false;
            }
        }
        return true;
    }, [product.customizationOptions, selectedCustomizations]);

    const [allObligatoryDone, setAllObligatoryDone] = useState(true);

    useEffect(() => {
        setAllObligatoryDone(areAllObligatorySectionsCompleted());
    }, [selectedCustomizations, areAllObligatorySectionsCompleted]);


    useEffect(() => {
        let price = product.price;
        const initialSelections = {};

        if (editingCartItemId && initialCustomizations) {
            if (product.id === 'arma_tu_burrito' && product.customizationOptions) {
                const proteinGroup = product.customizationOptions.find(g => g.id === 'proteina_arma');
                if (proteinGroup && proteinGroup.options.length > 0) {
                    const savedProteinLabel = initialCustomizations[proteinGroup.title];
                    const matchedProteinOption = savedProteinLabel ? proteinGroup.options.find(opt => opt.label === savedProteinLabel) : null;
                    if (matchedProteinOption) {
                        initialSelections[proteinGroup.id] = matchedProteinOption.value;
                        price = matchedProteinOption.priceSet || 0;
                    } else {
                        const defaultProtein = proteinGroup.options.find(opt => opt.isDefault) || proteinGroup.options[0];
                        initialSelections[proteinGroup.id] = defaultProtein.value;
                        price = defaultProtein.priceSet || 0;
                    }
                }
            }

            product.customizationOptions?.forEach(group => {
                if (group.id === 'proteina_arma' && initialSelections[group.id]) return;
                const savedGroupTitleCustomization = initialCustomizations[group.title];

                if (group.type === 'radio') {
                    const selectedOpt = group.options.find(opt => opt.label === savedGroupTitleCustomization);
                    if (selectedOpt) {
                        initialSelections[group.id] = selectedOpt.value;
                        if (selectedOpt.priceChange && group.id !== 'queso_arma') price += selectedOpt.priceChange;
                    } else if (group.options.length > 0) {
                        const defaultOption = group.options.find(opt => opt.isDefault) || group.options[0];
                        initialSelections[group.id] = defaultOption.value;
                        if (defaultOption.priceChange && group.id !== 'proteina_arma' && group.id !== 'queso_arma') price += defaultOption.priceChange;
                    }
                } else if (group.type === 'checkbox') {
                    initialSelections[group.id] = {};
                    group.options.forEach(opt => {
                        if (initialCustomizations[opt.label] === 'Sí') {
                            initialSelections[group.id][opt.value] = true;
                            if (opt.priceChange) price += opt.priceChange;
                        }
                    });
                } else if (group.type === 'textarea') {
                     initialSelections[group.id] = savedGroupTitleCustomization || '';
                }
            });
        } else {
            if (product.id === 'arma_tu_burrito' && product.customizationOptions) {
                const proteinGroup = product.customizationOptions.find(g => g.id === 'proteina_arma');
                if (proteinGroup && proteinGroup.options.length > 0) {
                    const defaultProtein = proteinGroup.options.find(opt => opt.isDefault) || proteinGroup.options[0];
                    initialSelections[proteinGroup.id] = defaultProtein.value;
                    price = defaultProtein.priceSet || 0;
                }
            }
            product.customizationOptions?.forEach(group => {
                if (group.id === 'proteina_arma' && initialSelections[group.id]) return;
                if (group.type === 'radio' && group.options.length > 0) {
                    const defaultOption = group.options.find(opt => opt.isDefault) || group.options[0];
                    initialSelections[group.id] = defaultOption.value;
                    if (defaultOption.priceChange && group.id !== 'queso_arma') price += defaultOption.priceChange;
                } else if (group.type === 'checkbox') {
                    initialSelections[group.id] = {};
                    group.options.forEach(opt => { if (opt.isDefault) { initialSelections[group.id][opt.value] = true; if (opt.priceChange) price += opt.priceChange; } });
                } else if (group.type === 'textarea') { initialSelections[group.id] = ''; }
            });
        }
        setSelectedCustomizations(initialSelections);
        setCurrentPrice(price);
    }, [product, initialCustomizations, editingCartItemId]);


    const handleOptionChange = (groupId, optionValue, groupType) => { setSelectedCustomizations(prev => { const newSelections = { ...prev }; if (groupType === 'checkbox') { const currentGroupSelections = newSelections[groupId] || {}; const currentGroupOptions = product.customizationOptions.find(g => g.id === groupId)?.options || []; const groupMaxChoices = product.customizationOptions.find(g => g.id === groupId)?.maxChoices; const currentSelectedCount = Object.values(currentGroupSelections).filter(Boolean).length; if (!currentGroupSelections[optionValue] && groupMaxChoices && currentSelectedCount >= groupMaxChoices) { console.log(`Max ${groupMaxChoices} choices allowed for ${groupId}`); return prev; } newSelections[groupId] = { ...currentGroupSelections, [optionValue]: !currentGroupSelections[optionValue] }; } else if (groupType === 'textarea') { newSelections[groupId] = optionValue; } else { newSelections[groupId] = optionValue; } let newPrice = product.price; if (product.id === 'arma_tu_burrito' && newSelections['proteina_arma']) { const proteinGroup = product.customizationOptions.find(g => g.id === 'proteina_arma'); const selectedProteinOpt = proteinGroup.options.find(opt => opt.value === newSelections['proteina_arma']); if (selectedProteinOpt && typeof selectedProteinOpt.priceSet === 'number') { newPrice = selectedProteinOpt.priceSet; } } product.customizationOptions?.forEach(group => { const selectionInGroup = newSelections[group.id]; if (selectionInGroup) { if (group.type === 'radio') { const opt = group.options.find(o => o.value === selectionInGroup); if (opt && opt.priceChange && group.id !== 'proteina_arma' && group.id !== 'queso_arma' ) newPrice += opt.priceChange; } else if (group.type === 'checkbox') { Object.keys(selectionInGroup).forEach(valKey => { if (selectionInGroup[valKey]) { const opt = group.options.find(o => o.value === valKey); if (opt && opt.priceChange) newPrice += opt.priceChange; } }); } } }); setCurrentPrice(newPrice); return newSelections; }); };
    const handleSaveCustomizations = () => { const finalCustomizationsForCart = {}; product.customizationOptions?.forEach(group => { const selectedValue = selectedCustomizations[group.id]; if (selectedValue) { if (group.type === 'radio') { const selectedOption = group.options.find(opt => opt.value === selectedValue); if (selectedOption) finalCustomizationsForCart[group.title] = selectedOption.label; } else if (group.type === 'checkbox') { Object.entries(selectedValue).forEach(([optionVal, isSelected]) => { if (isSelected) { const selectedOption = group.options.find(opt => opt.value === optionVal); if (selectedOption) finalCustomizationsForCart[selectedOption.label] = 'Sí'; } }); } else if (group.type === 'textarea' && selectedValue.trim() !== '') { finalCustomizationsForCart[group.title] = selectedValue.trim(); } } }); const itemToAdd = { ...product, price: currentPrice }; onAddToCart(itemToAdd, quantity, finalCustomizationsForCart); onClose(); };
    const renderCustomizationOptions = () => { if (!product.customizationOptions || product.customizationOptions.length === 0) { return <p className="text-gray-500 p-4 text-center">Este producto no tiene opciones de personalización adicionales.</p>; } return product.customizationOptions.map(group => ( <CustomizationSection key={group.id} title={group.title} hint={group.hint} maxChoices={group.maxChoices} currentSelectionCount={group.type === 'checkbox' ? Object.values(selectedCustomizations[group.id] || {}).filter(Boolean).length : undefined} obligatorio={group.obligatorio}> {group.type === 'textarea' ? ( <TextareaOption placeholder={group.placeholder} value={selectedCustomizations[group.id] || ''} onChange={(text) => handleOptionChange(group.id, text, group.type)} /> ) : ( group.options.map(option => { if (group.type === 'radio') { return ( <RadioOption key={option.value} name={group.id} value={option.value} label={option.label + (option.priceChange ? ` (+${formatPrice(option.priceChange)})` : (option.priceSet ? ` (${formatPrice(option.priceSet)})` : ''))} checked={selectedCustomizations[group.id] === option.value} onChange={(val) => handleOptionChange(group.id, val, group.type)} /> ); } else if (group.type === 'checkbox') { const currentGroupSelections = selectedCustomizations[group.id] || {}; const isDisabled = group.maxChoices && Object.values(currentGroupSelections).filter(Boolean).length >= group.maxChoices && !currentGroupSelections[option.value]; return ( <CheckboxOption key={option.value} label={option.label + (option.priceChange ? ` (+${formatPrice(option.priceChange)})` : '')} checked={!!currentGroupSelections[option.value]} onChange={() => handleOptionChange(group.id, option.value, group.type)} disabled={isDisabled} /> ); } return null; }) )} </CustomizationSection> )); };
    return ( <div className="h-full flex flex-col bg-white"> <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10"> <button onClick={onClose} className="text-gray-600 hover:text-gray-800"> <X size={24} /> </button> <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2> <div className="w-6"></div> </div> <div className="flex-grow overflow-y-auto p-4 pb-28 bg-gray-50"> <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4 shadow-md" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x300/757575/FFFFFF?text=Sin+Imagen`; }}/> <p className="text-gray-700 mb-1 text-sm">{product.description}</p> <p className="text-2xl font-bold mb-6 text-gray-800">{formatPrice(currentPrice)}</p> {renderCustomizationOptions()} </div>
        <div className="bg-white p-3 border-t shadow-top flex items-center justify-between space-x-3 sticky bottom-0 z-10">
            <div className="flex items-center">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-md hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" aria-label="Disminuir cantidad" > <MinusCircle size={24} /> </button>
                <span className="mx-3 text-lg font-semibold w-8 text-center text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-md hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" aria-label="Aumentar cantidad" > <PlusCircle size={24} /> </button>
            </div>
            <button
                onClick={handleSaveCustomizations}
                className="px-6 py-2 text-black rounded-full transition-colors font-semibold text-md shadow-md hover:brightness-95"
                style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER, color: 'black'}}
            >
                <div className="flex flex-col items-center leading-tight">
                    <span>{editingCartItemId ? 'Actualizar' : 'Agregar'}</span>
                    <span className="text-xs">{formatPrice(currentPrice * quantity)}</span>
                </div>
            </button>
        </div>
    </div> );
};
const CustomizationSection = ({ title, hint, obligatorio, children, maxChoices, currentSelectionCount }) => {
    const [isOpen, setIsOpen] = useState(true);
    useEffect(() => { if (obligatorio) setIsOpen(true); }, [obligatorio]);
    let displayHint = hint;
    if (maxChoices) { displayHint = `${hint ? hint + ' - ' : ''}Puedes elegir hasta ${maxChoices}. (${currentSelectionCount || 0}/${maxChoices} seleccionados)`; }
    return ( <div className="mb-4 bg-white p-4 rounded-lg shadow"> <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full mb-2 text-left"> <div><h3 className="font-semibold text-gray-700">{title}</h3>{displayHint && <p className="text-xs text-gray-500">{displayHint}</p>}</div> <div className="flex items-center"> {!isOpen && !obligatorio && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full mr-2" style={{backgroundColor: `${THEME_LIME_GREEN}44`, color: THEME_LIME_GREEN_DARKER}}>Listo</span>} {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />} </div> </button> {isOpen && <div className="space-y-2 pt-2 border-t border-gray-100">{children}</div>} </div> );
};
const RadioOption = ({ name, value, label, checked, onChange }) => (
    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer w-full">
        <span className="text-sm text-gray-700 mr-3">{label}</span>
        <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="form-radio h-5 w-5" style={{accentColor: THEME_LIME_GREEN}}/>
    </label>
);
const CheckboxOption = ({ label, checked, onChange, disabled }) => (
     <label className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-md w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <span className="text-sm text-gray-700 mr-3">{label}</span>
        <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-5 w-5 rounded" style={{accentColor: THEME_LIME_GREEN}} disabled={disabled}/>
    </label>
);
const TextareaOption = ({ placeholder, value, onChange }) => (
    <textarea className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:border-lime-500" style={{borderColor: THEME_LIME_GREEN_DARKER, focusRingColor: THEME_LIME_GREEN_DARKER}} rows="3" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
);

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null); // userId will now be a local UUID
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [appLoading, setAppLoading] = useState(false);
    const [isCustomizationPanelOpen, setIsCustomizationPanelOpen] = useState(false);
    const [productToCustomize, setProductToCustomize] = useState(null);
    const [deliveryMode, setDeliveryMode] = useState('delivery');
    const [editingCartItem, setEditingCartItem] = useState(null);

    // Simulate anonymous user ID generation on component mount
    useEffect(() => {
        setUserId('anonymous-' + crypto.randomUUID());
        setIsAuthReady(true); // Auth is "ready" immediately as no external auth is needed
    }, []);

    // Removed setupProductsInFirestore useEffect (no Firestore)
    // useEffect(() => {
    //       if (isAuthReady && process.env.REACT_APP_FIREBASE_CONFIG && JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG).apiKey && db) {
    //           setupProductsInFirestore();
    //       }
    // }, [isAuthReady]);

    // Products are now always from MOCK_PRODUCTS, no fetching needed
    useEffect(() => {
        // No external fetching, products are always MOCK_PRODUCTS
        // This useEffect can be removed or simplified if no dynamic product loading is desired
        // For now, we'll keep it to set products initially, though it's redundant with useState(MOCK_PRODUCTS)
        if (products.length === 0) { // Only set if products are somehow empty (shouldn't happen with MOCK_PRODUCTS)
            setProducts(MOCK_PRODUCTS);
        }
    }, [products]); // Depend on products to avoid infinite loop if setProducts is called

    // Cart items are now managed entirely in local state, no Firestore listener
    // useEffect(() => {
    //       if (!userId || !isAuthReady || !(process.env.REACT_APP_FIREBASE_CONFIG && JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG).apiKey && db)) { return; }
    //       const cartRef = collection(db, `/artifacts/${appId}/users/${userId}/cartItems`);
    //       const unsubscribeCart = onSnapshot(cartRef, (snapshot) => { setCartItems(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))); }, (error) => { console.error("Error fetching cart: ", error); });
    //       return () => unsubscribeCart();
    // }, [userId, isAuthReady, appId]);

    const handleOpenCustomizationPanel = (product, cartItemToEdit = null) => {
        setProductToCustomize(product);
        setEditingCartItem(cartItemToEdit);
        currentProductForCustomizationState = product;
        setIsCustomizationPanelOpen(true);
        document.body.style.overflow = 'hidden';
    };
    const handleCloseCustomizationPanel = () => {
        setIsCustomizationPanelOpen(false);
        currentProductForCustomizationState = null;
        setEditingCartItem(null);
        document.body.style.overflow = 'auto';
        setTimeout(() => setProductToCustomize(null), 300);
    };

    // Modified handleAddToCart to only use local state
    const handleAddToCart = async (productData, quantity, customizations = {}, isComplementary = false, editingCartItemId = null) => {
        if (!isAuthReady) { console.warn("Auth not ready."); return; } // Still relevant for local state
        const cartItemPayload = {
            productId: productData.id,
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl,
            quantity: quantity,
            customizations: customizations,
            // addedAt: new Date() // For local state, use client-side timestamp
        };

        // All cart operations now use local state
        setCartItems(prevItems => {
            if (editingCartItemId) {
                // Update existing item
                return prevItems.map(item => item.id === editingCartItemId ? { ...item, ...cartItemPayload, addedAt: item.addedAt } : item);
            } else {
                // Add new item or update quantity of existing identical item
                const localId = crypto.randomUUID();
                // Check if an item with the same product ID and customizations already exists
                const existingIdx = prevItems.findIndex(i =>
                    i.productId === productData.id &&
                    JSON.stringify(i.customizations || {}) === JSON.stringify(customizations || {})
                );
                if (existingIdx > -1) {
                    const updatedItems = [...prevItems];
                    updatedItems[existingIdx].quantity += quantity;
                    return updatedItems;
                } else {
                    return [...prevItems, { ...cartItemPayload, id: localId, addedAt: new Date() }];
                }
            }
        });
        console.log(editingCartItemId ? `${productData.name} updated in local cart.` : `${productData.name} added to local cart.`);
        if(isComplementary) { console.log("Complementary item added, staying on cart page.");}
    };

    const handleAddToCartAndClosePanel = (product, quantity, customizations) => {
        handleAddToCart(product, quantity, customizations, false, editingCartItem ? editingCartItem.id : null);
        handleCloseCustomizationPanel();
    };

    // Modified handleUpdateQuantity to only use local state
    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(cartItemId);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === cartItemId ? {...i, quantity: newQuantity} : i));
    };

    // Modified handleRemoveItem to only use local state
    const handleRemoveItem = async (cartItemId) => {
        setCartItems(prev => prev.filter(i => i.id !== cartItemId));
    };

    // Modified handleClearCart to only use local state
    const handleClearCart = async () => {
        setCartItems([]);
    };

    const renderPage = () => {
        // appLoading state can be simplified or removed if no async loading is present
        if (appLoading) { return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Cargando Brutal Burritos...</p></div>; }
        switch (currentPage) {
            case 'home': return <HomePage products={products} setCurrentPage={setCurrentPage} onAddToCart={handleAddToCart} onCustomize={handleOpenCustomizationPanel} userId={userId} deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode} />;
            case 'cart': return <CartPage cartItems={cartItems} products={products} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} setCurrentPage={setCurrentPage} onClearCart={handleClearCart} onAddToCart={handleAddToCart} onEditItem={handleOpenCustomizationPanel} />;
            case 'checkout':
                const subtotal = cartItems.reduce((sum, item) => { const pDetails = products.find(p => p.id === item.productId); return sum + ((item.price || (pDetails ? pDetails.price : 0)) * item.quantity); }, 0);
                return <CheckoutPage cartItems={cartItems} products={products} setCurrentPage={setCurrentPage} subtotal={subtotal} initialDeliveryMode={deliveryMode} />;
            default: setCurrentPage('home'); return <HomePage products={products} setCurrentPage={setCurrentPage} onAddToCart={handleAddToCart} onCustomize={handleOpenCustomizationPanel} userId={userId} deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode} />;
        }
    };

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => { const pDetails = products.find(p => p.id === item.productId); return sum + ((item.price || (pDetails ? pDetails.price : 0)) * item.quantity); }, 0);
    const firstCartItemImage = cartItems.length > 0 ? (cartItems[0].imageUrl || products.find(p => p.id === cartItems[0].productId)?.imageUrl) : `https://placehold.co/40x40/${THEME_BRAND_RED.substring(1)}/FFFFFF?text=BB`;

    return (
        <div className="font-sans bg-gray-100 min-h-screen flex flex-col relative overflow-x-hidden">
            <Header
                currentPage={currentPage} setCurrentPage={setCurrentPage} cartItemCount={cartItemCount}
                isCustomizationPanelOpen={isCustomizationPanelOpen}
                productBeingCustomizedName={productToCustomize?.name}
            />
            <main className="max-w-4xl mx-auto w-full flex-grow">
                {renderPage()}
            </main>

            {productToCustomize && (
                <div
                    className={`fixed inset-0 z-[60] bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out ${isCustomizationPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={handleCloseCustomizationPanel}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 w-full max-w-4xl mx-auto shadow-2xl rounded-t-2xl transform transition-transform duration-300 ease-in-out ${isCustomizationPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        style={{ height: '100vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CustomizationPlaceholderPage
                            product={productToCustomize}
                            initialQuantity={editingCartItem ? editingCartItem.quantity : 1}
                            initialCustomizations={editingCartItem ? editingCartItem.customizations : {}}
                            editingCartItemId={editingCartItem ? editingCartItem.id : null}
                            onAddToCart={handleAddToCartAndClosePanel}
                            onClose={handleCloseCustomizationPanel}
                        />
                    </div>
                </div>
            )}

            {cartItems.length > 0 && currentPage === 'home' && !isCustomizationPanelOpen && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 shadow-lg flex items-center justify-between max-w-4xl mx-auto md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[calc(100%-2rem)] md:rounded-lg z-40">
                    <div className="flex items-center">
                        <img src={firstCartItemImage} alt="Cart item" className="w-10 h-10 object-cover rounded-md mr-3"
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/40x40/757575/FFFFFF?text=Item`; }} />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{cartItemCount} producto{cartItemCount > 1 ? 's' : ''}</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(cartTotal)}</p>
                        </div>
                    </div>
                    <button onClick={() => setCurrentPage('cart')}
                        className="text-black py-3 px-5 rounded-full font-semibold transition-colors text-sm shadow-md" style={{backgroundColor: THEME_LIME_GREEN, borderColor: THEME_LIME_GREEN_DARKER}}>
                        Ir a canasta
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
