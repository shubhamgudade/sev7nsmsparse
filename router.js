

const fs   = require("fs");
const path = require("path");

const CONFIG_PATH = path.resolve(__dirname, "../assets/data/config.json");

/* ═══════════════════════════════════════════════════
   KEYWORD TABLES — auto-generated, do not edit manually
   run inject_keywords.py to regenerate
   ═══════════════════════════════════════════════════ */

const OPERATOR_KEYWORDS = {
    jio:     [
    "jio",
    "जियो",
    "जीओ",
    "जिओ",
    "जिनो",
    "रिलायंस",
    "ஜியோ",
    "ஜிஓ",
    "జియో",
    "జిఓ",
    "জিও",
    "জিয়ো",
    "જિઓ",
    "જીઓ",
    "ಜಿಯೋ",
    "ಜಿಓ",
    "ಜಿಯೊ",
    "ജിയോ",
    "ജിഒ",
    "ଜିଓ",
    "ଜିୟୋ",
    "ਜੀਓ",
    "ਜਿਓ"
],
    airtel:  [
    "airtel",
    "एयरटेल",
    "एअरटेल",
    "एरटेल",
    "ஏர்டெல்",
    "எயார்டெல்",
    "ఎయిర్టెల్",
    "ఎర్టెల్",
    "এয়ারটেল",
    "এরটেল",
    "એરટેલ",
    "એयरटेल",
    "ਏਅਰਟੈੱਲ",
    "ਏਰਟੈੱਲ",
    "എയർടെൽ",
    "എർടെൽ",
    "ಏರ್ಟೆಲ್",
    "ಎಯರ್ಟೆಲ್",
    "ଆୟାରଟେଲ",
    "ଏୟାରଟେଲ୍"
],
    vi_bsnl: [
    "vodafone",
    "idea cellular",
    "vi recharge",
    "vi pack",
    "vi app",
    "vi data",
    "वोडाफोन",
    "वोडाफ़ोन",
    "आइडिया",
    "आईडिया",
    "वी आई",
    "வோடாஃபோன்",
    "ஐடியா",
    "వోడాఫోన్",
    "ఐడియా",
    "ভোডাফোন",
    "આઇડિયા",
    "વોડાફોન",
    "આઇડિયા",
    "ਵੋਡਾਫੋਨ",
    "આਈਡੀਆ",
    "വോഡാഫോൺ",
    "ആઇડિયા",
    "ਵੋਡਾਫੋਨ",
    "આઇડિયા",
    "ଭି ଆଇ",
    "વી આઈ",
    "வி ஐ",
    "వి ఐ",
    "ভি আই",
    "വി ഐ",
    "ವಿ ಐ",
    "ਵੀ ਆਈ",
    "bsnl",
    "बीएसएनएल",
    "भारत संचार निगम",
    "भारत संचार",
    "பிஎஸ்என்எல்",
    "பாரத் சஞ்சார்",
    "బిఎస్ఎన్ఎల్",
    "భారత్ సంచార్",
    "বিএসএনএল",
    "ভারত সঞ্চার",
    "બીએસએનએલ",
    "ભારત સંચાર",
    "ਬੀਐਸਐਨਐਲ",
    "ਭಾರਤ ਸੰਚಾರ್",
    "ബിഎസ്എൻഎൽ",
    "ഭാരത് സഞ്ചാർ",
    "ಬಿಎಸ್ಎನ್ಎൽ",
    "ಭಾರತ್ ಸಂಚಾರ್",
    "ବିଏସଏନଏଲ"
]
};

const CATEGORY_KEYWORDS = {
    categories: [
    "debited",
    "credited",
    "a/c",
    "acct",
    "available bal",
    "avl bal",
    "upi",
    "neft",
    "imps",
    "rtgs",
    "txn",
    "transaction",
    "sbi",
    "hdfc",
    "icici",
    "axis bank",
    "kotak",
    "pnb",
    "canara",
    "bank of baroda",
    "union bank",
    "indian bank",
    "ifsc",
    "emi",
    "loan",
    "credit card",
    "debit card",
    "atm",
    "withdraw",
    "deposit",
    "fd",
    "fixed deposit",
    "net banking",
    "mobile banking",
    "chequebook",
    "savings account",
    "current account",
    "passbook",
    "mini statement",
    "account balance",
    "bank account",
    "your account",
    "बैंक",
    "खाता",
    "डेबिट",
    "क्रेडिट",
    "शेष",
    "राशि",
    "यूपीआई",
    "एनईएफटी",
    "आईएमपीएस",
    "निकासी",
    "जमा",
    "लेनदेन",
    "ऋण",
    "ईएमआई",
    "बचत खाता",
    "चालू खाता",
    "पासबुक",
    "चेकबुक",
    "बँक",
    "खाते",
    "शिल्लक",
    "रक्कम",
    "व्यवहार",
    "कर्ज",
    "ईएमआय",
    "வங்கி",
    "கணக்கு",
    "டெபிட்",
    "கிரெடிட்",
    "இருப்பு",
    "பரிவர்த்தனை",
    "கடன்",
    "வைப்பு",
    "யூபிஐ",
    "బ్యాంక్",
    "ఖాతా",
    "బాలెన్స్",
    "లావాదేవీ",
    "రుణం",
    "డిపాజిట్",
    "యుపిఐ",
    "ব্যাংক",
    "অ্যাকাউন্ট",
    "ব্যালেন্স",
    "লেনদেন",
    "બેંક",
    "ખાતું",
    "બેલેન્સ",
    "વ્યવહાર",
    "બੈਂક",
    "ખાતા",
    "ਡੈਬਿਟ",
    "ਕ੍ਰੈਡਿਟ",
    "ਬੈਲੇਂਸ",
    "ਲੈਣਦੇਣ",
    "ਕਰਜ਼ਾ",
    "ਜਮ੍ਹਾਂ",
    "ਯੂਪੀਆਈ",
    "ബാങ്ക്",
    "അക്കൗണ്ട്",
    "ബാലൻസ്",
    "ഇടപാട്",
    "വായ്പ",
    "നിക്ഷേപം",
    "ಬ್ಯಾಂಕ್",
    "ಖಾತೆ",
    "ಬ್ಯಾಲೆನ್ಸ್",
    "ವಹಿವಾಟು",
    "ಸಾಲ",
    "ಠೇವಣಿ",
    "ବ୍ୟାଙ୍କ",
    "ଖାତା",
    "otp",
    "one time password",
    "one-time password",
    "verification code",
    "do not share",
    "do not disclose",
    "expires in",
    "valid for",
    "is your otp",
    "is the otp",
    "security code",
    "auth code",
    "passcode",
    "enter this code",
    "login code",
    "use this code",
    "ओटीपी",
    "सत्यापन कोड",
    "साझा न करें",
    "पासकोड",
    "वन टाइम",
    "सत्यापन",
    "शेअर करू नका",
    "ஓடிபி",
    "சரிபார்ப்பு குறியீடு",
    "பகிர வேண்டாம்",
    "ఓటీపీ",
    "ధృవీకరణ కోడ్",
    "షేర్ చేయవద్దు",
    "ওটিপি",
    "যাচাই কোড",
    "শেয়ার করবেন না",
    "ઓટીપી",
    "ચકાસણી કોડ",
    "શેર કરશો નહીં",
    "ਓਟੀਪੀ",
    "ਤਸਦੀਕ ਕੋਡ",
    "ਸਾਂਝਾ ਨਾ ਕਰੋ",
    "ഒടിപി",
    "സ്ഥിരീകരണ കോഡ്",
    "പങ്കിടരുത്",
    "ಒಟಿಪಿ",
    "ಪರಿಶೀಲನೆ ಕೋಡ್",
    "ಹಂಚಿಕೊಳ್ಳಬೇಡಿ",
    "data balance",
    "data pack",
    "talktime",
    "validity",
    "plan activated",
    "roaming",
    "incoming calls",
    "prepaid",
    "postpaid",
    "bill generated",
    "due date",
    "sim",
    "port your number",
    "upc request",
    "porting",
    "mnp",
    "mb left",
    "gb left",
    "unlimited calls",
    "night data",
    "extra data",
    "addon",
    "recharge",
    "your plan",
    "data add",
    "डेटा बैलेंस",
    "डेटा पैक",
    "टॉकटाइम",
    "वैधता",
    "प्लान",
    "रोमिंग",
    "प्रीपेड",
    "पोस्टपेड",
    "बिल",
    "रिचार्ज",
    "सिम",
    "डेटा",
    "प्लॅन",
    "कॉलिंग",
    "ડેટા બેલેન્સ",
    "ડેટા પેક",
    "ટોકટાઇમ",
    "માન્યતા",
    "પ્લાન",
    "રિચાર્જ",
    "સિમ",
    "ડેટા",
    "டேட்டா பேலன்ஸ்",
    "டேட்டா பேக்",
    "பேச்சு நேரம்",
    "செல்லுபடி",
    "திட்டம்",
    "ரோமிங்",
    "ரீசார்ஜ்",
    "சிம்",
    "டேட்டா",
    "வாய்ஸ்",
    "அழைப்புகள்",
    "డేటా బ్యాలెన్స్",
    "డేటా ప్యాక్",
    "టాక్టైమ్",
    "చెల్లుబాటు",
    "ప్లాన్",
    "రీచార్జ్",
    "సిమ్",
    "డేటా",
    "వాయిస్",
    "కాల్స్",
    "ডেটা ব্যালেন্স",
    "ডেটা প্যাক",
    "টকটাইম",
    "মেয়াদ",
    "প্ল্যান",
    "রোমিং",
    "রিচার্জ",
    "সিম",
    "ডেটা",
    "ডাটা",
    "ভয়েস",
    "প্লেনৰ",
    "ৰিচাৰ্জ",
    "কোল",
    "ଡାଟା ବ୍ୟାଲେନ୍ସ",
    "ଡାଟା ପ୍ୟାକ୍",
    "ଟକ୍ ଟାଇମ୍",
    "ବୈଧତା",
    "ପ୍ଲାନ୍",
    "ରୋମିଂ",
    "ରିଚାର୍ଜ",
    "ସିମ୍",
    "ଡାଟା",
    "ଭଏସ୍",
    "କଲ୍",
    "ഡേറ്റ ബാലൻസ്",
    "ഡേറ്റ പാക്ക്",
    "ടോക്ക്ടൈം",
    "സാധുത",
    "പ്ലാൻ",
    "റോമിംഗ്",
    "റീചാർജ്",
    "സിം",
    "ഡാറ്റ",
    "വോയ്‌സ്",
    "കോളുകൾ",
    "റീച്ചാർജ്",
    "ಡೇಟಾ ಬ್ಯಾಲೆನ್ಸ್",
    "ಡೇಟಾ ಪ್ಯಾಕ್",
    "ಟಾಕ್‌ಟೈಮ್",
    "ಮಾನ್ಯತೆ",
    "ರೋಮಿಂಗ್",
    "ರೀಚಾರ್ಜ್",
    "ಸಿಮ್",
    "ಡೇಟಾ",
    "ಪ್ಲಾನ್",
    "ಯೋಜನೆ",
    "ವಾಯ್ಸ್",
    "ಕರೆಗಳು",
    "ರಿಚಾರ್ಜ್",
    "ಪೋರ್ಟ್",
    "ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತದೆ",
    "ਡੇਟਾ ਬੈਲੇਂਸ",
    "ਡੇਟਾ ਪੈਕ",
    "ਟਾਕਟਾਈਮ",
    "ਵੈਧਤਾ",
    "ਪਲਾਨ",
    "ਰੋਮਿੰਗ",
    "ਰੀਚਾਰਜ",
    "ਸਿਮ",
    "ਡੇਟਾ"
],
    misc:       [
    "pnr",
    "flight",
    "irctc",
    "train no",
    "boarding pass",
    "departure",
    "arrival",
    "seat no",
    "coach",
    "platform",
    "ola",
    "uber",
    "rapido",
    "driver",
    "cab",
    "ride",
    "otp to start",
    "airport",
    "bus ticket",
    "hotel booking",
    "check-in",
    "checkout",
    "reservation",
    "indigo",
    "spicejet",
    "air india",
    "vistara",
    "your ride",
    "your driver",
    "पीएनआर",
    "उड़ान",
    "ट्रेन",
    "आरक्षण",
    "टिकट",
    "प्रस्थान",
    "आगमन",
    "सीट",
    "प्लेटफॉर्म",
    "ड्राइवर",
    "कैब",
    "यात्रा",
    "विमान",
    "प्रયાણ",
    "ચાલક",
    "પ્રવાસ",
    "பிஎன்ஆர்",
    "ரயில்",
    "முன்பதிவு",
    "டிக்கெட்",
    "புறப்பாடு",
    "வருகை",
    "இருக்கை",
    "டிரைவர்",
    "கேப்",
    "పిఎన్ఆర్",
    "రైలు",
    "రిజర్వేషన్",
    "టికెట్",
    "బయలుదేరుట",
    "రాక",
    "సీటు",
    "డ్రైవర్",
    "క్యాబ్",
    "পিএনআর",
    "ট্রেন",
    "রিজার্ভেশন",
    "টিকিট",
    "প্রস্থান",
    "সিট",
    "ড্রাইভার",
    "ক্যাব",
    "પીએનઆર",
    "આરક્ષણ",
    "ટિકિટ",
    "પ્રસ્થાન",
    "આગમન",
    "ડ્રાઇવર",
    "કેબ",
    "ਪੀਐਨਆਰ",
    "ਜਹਾਜ਼",
    "ਰੇਲਗੱਡੀ",
    "ਰਾਖਵਾਂਕਰਨ",
    "ਰਵਾਨਗੀ",
    "സീറ്റ്",
    "ഡ്രൈവർ",
    "ക്യാബ്",
    "ಪಿಎನ್ಆರ್",
    "ಮೀಸಲಾತಿ",
    "ನಿರ್ಗಮನ",
    "ಸೀಟು",
    "order id",
    "order no",
    "order #",
    "shipped",
    "out for delivery",
    "delivered",
    "dispatch",
    "amazon",
    "flipkart",
    "myntra",
    "meesho",
    "snapdeal",
    "nykaa",
    "ajio",
    "tata cliq",
    "tracking",
    "shipment",
    "return initiated",
    "refund",
    "awb",
    "consignment",
    "invoice",
    "your order",
    "your package",
    "ऑर्डर",
    "डिलीवरी",
    "शिपमेंट",
    "वापसी",
    "रिफंड",
    "ट्रैकिंग",
    "पैकेज",
    "डिस्पैच",
    "ડિલિવરી",
    "પરતાવા",
    "ஆர்டர்",
    "டெலிவரி",
    "ஷிப்மெண்ட்",
    "திரும்பப் பெறுதல்",
    "ரீஃபண்ட்",
    "ఆర్డర్",
    "డెలివరీ",
    "షిప్మెంట్",
    "రిటర్న్",
    "రీఫండ్",
    "অর্ডার",
    "ডেলিভারি",
    "শিপমেন্ট",
    "ফেরত",
    "রিফান্ড",
    "ઓર્ડર",
    "ડિલિવરી",
    "શિપમેન્ટ",
    "પરત",
    "રિફંડ",
    "ਆਰਡਰ",
    "ਡਿਲੀਵਰੀ",
    "ਸ਼ਿਪਮੈਂਟ",
    "ਵਾਪਸੀ",
    "ਰਿਫੰਡ",
    "ഓർഡർ",
    "ഡെലിവറി",
    "ஷிപ്മെന്റ്",
    "റിട്ടേൺ",
    "റീഫണ്ട്",
    "ಆರ್ಡರ್",
    "ಡೆಲಿವರಿ",
    "ಶಿಪ್ಮೆಂಟ್",
    "ರಿಟರ್ನ್",
    "ರಿಫಂಡ್",
    "swiggy",
    "zomato",
    "zepto",
    "blinkit",
    "dunzo",
    "bigbasket",
    "instamart",
    "jiomart",
    "grofers",
    "restaurant",
    "arriving in",
    "delivery partner",
    "order accepted",
    "preparing your order",
    "picked up",
    "minutes away",
    "food delivery",
    "your food",
    "स्विगी",
    "ज़ोमैटो",
    "ज़ेप्टो",
    "ब्लिंकिट",
    "खाना",
    "रेस्टोरेंट",
    "फूड",
    "डिलीवरी पार्टनर",
    "ઝોમેટો",
    "ખાણે",
    "રેસ્ટોરન્ટ",
    "ஸ்விகி",
    "ஜொமேட்டோ",
    "உணவு",
    "உணவகம்",
    "டெலிவரி பார்ட்னர்",
    "స్విగ్గీ",
    "జొమాటో",
    "ఆహారం",
    "రెస్టారెంట్",
    "డెలివరీ పార్టనర్",
    "সুইগি",
    "জোমাটো",
    "খাবার",
    "রেস্তোরাঁ",
    "ডেলিভারি পার্টনার",
    "સ્વિગી",
    "ઝોમેટો",
    "ખોરાક",
    "રેસ્ટોરન્ટ",
    "ડિલિવરી પાર્ટનર",
    "ਸਵਿੱਗੀ",
    "ਜ਼ੋਮੈਟੋ",
    "ਖਾਣਾ",
    "ਰੈਸਟੋਰੈਂਟ",
    "ਡਿਲੀਵਰੀ ਪਾਰਟਨਰ",
    "സ്വിഗ്ഗി",
    "സൊമാറ്റോ",
    "ഭക്ഷണം",
    "റെസ്റ്റോറന്റ്",
    "ഡെലിവറി പാർട്ണർ",
    "ಸ್ವಿಗ್ಗಿ",
    "ಝೊಮಾಟೋ",
    "ಆಹಾರ",
    "ರೆಸ್ಟೋರೆಂಟ್",
    "ಡೆಲಿವರಿ ಪಾರ್ಟ್ನರ್",
    "aadhaar",
    "uidai",
    "pan card",
    "income tax",
    "itr",
    "epfo",
    "pf account",
    "voter id",
    "election",
    "passport",
    "driving licence",
    "rto",
    "challan",
    "ration card",
    "subsidy",
    "ministry",
    "government of india",
    "nrega",
    "jan dhan",
    "umang",
    "digilocker",
    "cowin",
    "pm kisan",
    "nha",
    "tnepds",
    "आधार",
    "पैन कार्ड",
    "आयकर",
    "ईपीएफओ",
    "पीएफ",
    "मतदाता",
    "चुनाव",
    "पासपोर्ट",
    "ड्राइविंग लाइसेंस",
    "राशन कार्ड",
    "सब्सिडी",
    "सरकार",
    "पेंशन",
    "પૅન કાર્ડ",
    "મતદાર",
    "નિર્વાચન",
    "રેશન કાર્ડ",
    "અનુદાન",
    "પેન્શન",
    "ஆதார்",
    "பான் கார்டு",
    "வருமான வரி",
    "வாக்காளர்",
    "தேர்தல்",
    "கடவுச்சீட்டு",
    "ரேஷன் அட்டை",
    "அரசு",
    "மானியம்",
    "ఆధార్",
    "పాన్ కార్డ్",
    "ఆదాయపు పన్ను",
    "ఓటరు",
    "ఎన్నిక",
    "పాస్పోర్ట్",
    "రేషన్ కార్డ్",
    "సబ్సిడీ",
    "ప్రభుత్వం",
    "আধার",
    "প্যান কার্ড",
    "আয়কর",
    "ভোটার",
    "নির্বাচন",
    "পাসপোর্ট",
    "রেশন কার্ড",
    "ভর্তুকি",
    "সরকার",
    "આધાર",
    "પાન કાર્ડ",
    "આવકવેરો",
    "ચૂંટણી",
    "ਆਧਾਰ",
    "ਪੈਨ કਾਰਡ",
    "ਆਮਦਨ ਕਰ",
    "ਵੋਟਰ",
    "ਚੋਣ",
    "ਰਾਸ਼ਨ કਾਰਡ",
    "ਸਬਸਿਡੀ",
    "ਸਰਕਾਰ",
    "ആധാർ",
    "പാൻ കാർഡ്",
    "ആദായ നികുതി",
    "വോട്ടർ",
    "തിരഞ്ഞെടുപ്പ്",
    "പാസ്പോർട്ട്",
    "റേഷൻ കാർഡ്",
    "സർക്കാർ",
    "ಆಧಾರ್",
    "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    "ಆದಾಯ ತೆರಿಗೆ",
    "ಮತದಾರ",
    "ಚುನಾವಣೆ",
    "ಪಾಸ್ಪೋರ್ಟ್",
    "electricity",
    "electric bill",
    "power bill",
    "bescom",
    "msedcl",
    "tata power",
    "adani electric",
    "gas bill",
    "piped gas",
    "water bill",
    "lpg",
    "cylinder",
    "dth",
    "tata sky",
    "dish tv",
    "insurance",
    "premium",
    "policy no",
    "lic",
    "claim",
    "mutual fund",
    "sip",
    "nav",
    "units allotted",
    "nps",
    "ppf",
    "investment",
    "portfolio",
    "बिजली",
    "बिजली बिल",
    "गैस",
    "पानी का बिल",
    "एलपीजी",
    "सिलेंडर",
    "बीमा",
    "प्रीमियम",
    "पॉलिसी",
    "निवेश",
    "म्यूचुअल फंड",
    "વીજળી",
    "વીજળી બિલ",
    "ગૅસ",
    "પાણી બિલ",
    "સિલિન્ડર",
    "વિમા",
    "ગુકાણ",
    "மின்சாரம்",
    "மின் கட்டணம்",
    "கேஸ்",
    "தண்ணீர் கட்டணம்",
    "எல்பிஜி",
    "சிலிண்டர்",
    "காப்பீடு",
    "பிரீமியம்",
    "முதலீடு",
    "విద్యుత్",
    "విద్యుత్ బిల్",
    "గ్యాస్",
    "నీటి బిల్",
    "సిలిండర్",
    "బీమా",
    "ప్రీమియం",
    "పెట్టుబడి",
    "বিদ্যুৎ",
    "বিদ্যুৎ বিল",
    "ग্যাস",
    "জলের বিল",
    "সিলিন্ডার",
    "বীমা",
    "প্রিমিয়াম",
    "বিনিয়োগ",
    "વીજળી",
    "વીજળી બિલ",
    "ગેસ",
    "પાણીનું બિલ",
    "વીમો",
    "રોકાણ",
    "ਬਿਜਲੀ",
    "ਬਿਜਲੀ ਬਿੱਲ",
    "ਪਾਣੀ ਦਾ ਬਿੱਲ",
    "ਐਲਪੀਜੀ",
    "ਸਿਲੰਡਰ",
    "ਬੀਮਾ",
    "ਨਿਵੇਸ਼",
    "വൈദ്യുതി",
    "വെള്ളം ബിൽ",
    "സിലിണ്ടർ",
    "ഇൻഷുറൻസ്",
    "നിക്ഷേപം",
    "ವಿದ್ಯುತ್",
    "ನೀರಿನ ಬಿಲ್",
    "ವಿಮೆ",
    "ಹೂಡಿಕೆ"
]
};

/* ═══════════════════════════════════════════════════
   CONFIG CACHE
   ═══════════════════════════════════════════════════ */

let _config = null;

function getConfig() {
    if (_config) return _config;
    try {
        _config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        return _config;
    } catch (err) {
        throw new Error(`[router] config.json read failed: ${err.message}`);
    }
}

/* ═══════════════════════════════════════════════════
   UNICODE SCRIPT DETECTION
   Only used for jio — decides heavy vs regional
   ═══════════════════════════════════════════════════ */

function detectScript(text) {
    const counts = {
        devanagari: 0,
        gujarati:   0,
        bengali:    0,
        gurmukhi:   0,
        odia:       0,
        tamil:      0,
        telugu:     0,
        kannada:    0,
        malayalam:  0
    };
    for (const ch of text) {
        const cp = ch.codePointAt(0);
        if (cp >= 0x0900 && cp <= 0x097F) counts.devanagari++;
        else if (cp >= 0x0A80 && cp <= 0x0AFF) counts.gujarati++;
        else if (cp >= 0x0980 && cp <= 0x09FF) counts.bengali++;
        else if (cp >= 0x0A00 && cp <= 0x0A7F) counts.gurmukhi++;
        else if (cp >= 0x0B00 && cp <= 0x0B7F) counts.odia++;
        else if (cp >= 0x0B80 && cp <= 0x0BFF) counts.tamil++;
        else if (cp >= 0x0C00 && cp <= 0x0C7F) counts.telugu++;
        else if (cp >= 0x0C80 && cp <= 0x0CFF) counts.kannada++;
        else if (cp >= 0x0D00 && cp <= 0x0D7F) counts.malayalam++;
    }
    const [script, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { script, count };
}

function getJioBucket(text) {
    const { script, count } = detectScript(text);
    if (count === 0) return "jio_heavy"; // english → heavy
    if (script === "devanagari" || script === "gujarati") return "jio_heavy";
    return "jio_regional";
}

/* ═══════════════════════════════════════════════════
   OPERATOR DETECTION — hardcoded split logic
   ═══════════════════════════════════════════════════ */

function matchOperator(text) {
    const lower = text.toLowerCase();
    for (const [op, keywords] of Object.entries(OPERATOR_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw.toLowerCase())) return op;
        }
    }
    return null;
}

/* ═══════════════════════════════════════════════════
   CATEGORY DETECTION — fully dynamic from config.json
   Any bucket not handled by operator logic falls here.
   Buckets in config that aren't jio_heavy/jio_regional/
   operators_airtel/operators_vi_bsnl are auto-matched
   against CATEGORY_KEYWORDS by bucket name.
   ═══════════════════════════════════════════════════ */

const OPERATOR_BUCKETS = new Set([
    "jio_heavy", "jio_regional",
    "operators_airtel", "operators_vi_bsnl"
]);

function matchCategory(text) {
    const lower = text.toLowerCase();
    // iterate keyword table — bucket names must match config.json bucket keys
    for (const [bucket, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw.toLowerCase())) return bucket;
        }
    }
    return null;
}

/* ═══════════════════════════════════════════════════
   CLASSIFY — operator first, then category, else drop
   ═══════════════════════════════════════════════════ */

function classifySms(text) {
    const op = matchOperator(text);
    if (op === "jio")     return getJioBucket(text);
    if (op === "airtel")  return "operators_airtel";
    if (op === "vi_bsnl") return "operators_vi_bsnl";

    const cat = matchCategory(text);
    if (cat) return cat;

    return null; // drop
}

/* ═══════════════════════════════════════════════════
   PROCESSOR URL RESOLUTION — dynamic from config
   ═══════════════════════════════════════════════════ */

function resolveProcessors(bucketName) {
    const config = getConfig();
    const bucket = config.buckets[bucketName];
    if (!bucket || !Array.isArray(bucket.processors)) return [];
    return bucket.processors
        .map(name => config.agents[name])
        .filter(Boolean);
}

async function forwardToProcessors(urls, deviceId, smsBatch) {
    if (!urls.length || !smsBatch.length) return {};

    const sliceSize = Math.ceil(smsBatch.length / urls.length);
    const requests  = urls.map((url, i) => {
        const slice = smsBatch.slice(i * sliceSize, (i + 1) * sliceSize);
        if (!slice.length) return Promise.resolve({});
        return fetch(`${url}/parse`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ deviceId, sms: slice })
        })
        .then(r => r.ok ? r.json() : {})
        .then(data => data.evidence || {})
        .catch(() => ({}));
    });

    const results = await Promise.all(requests);
    return mergeEvidence(results);
}

/* ═══════════════════════════════════════════════════
   EVIDENCE MERGE
   ═══════════════════════════════════════════════════ */

function mergeEvidence(evidenceList) {
    const merged = {};
    for (const evidence of evidenceList) {
        for (const [phone, data] of Object.entries(evidence)) {
            if (!merged[phone]) merged[phone] = { count: 0, confirmed: true, sms: [] };
            merged[phone].count += data.count || 0;
            for (const smsText of (data.sms || [])) {
                if (merged[phone].sms.length < 10 && !merged[phone].sms.includes(smsText)) {
                    merged[phone].sms.push(smsText);
                }
            }
            if (merged[phone].count > 10) merged[phone].count = 10;
        }
    }
    return merged;
}

/* ═══════════════════════════════════════════════════
   MAIN ROUTE + FORWARD — fully dynamic
   Reads all buckets from config, not hardcoded
   ═══════════════════════════════════════════════════ */

const RE_TEN_DIGIT = /[6-9]\d{9}/;

async function routeAndForward(deviceId, smsList) {
    const config    = getConfig();
    const bucketMap = {};

    for (const text of smsList) {
        if (!RE_TEN_DIGIT.test(text)) continue;
        const bucket = classifySms(text);
        if (!bucket) continue;
        // validate bucket exists in config — drop if not
        if (!config.buckets[bucket]) continue;
        if (!bucketMap[bucket]) bucketMap[bucket] = [];
        bucketMap[bucket].push(text);
    }

    const promises = Object.entries(bucketMap).map(([bucket, sms]) => {
        const urls = resolveProcessors(bucket);
        return forwardToProcessors(urls, deviceId, sms);
    });

    const results = await Promise.all(promises);
    return mergeEvidence(results);
}

/* ═══════════════════════════════════════════════════
   ALPHA DISTRIBUTION — dynamic agent list from config
   Add agents to config.alpha.agents to scale
   ═══════════════════════════════════════════════════ */

async function distributeAcrossAlphas(deviceId, smsList) {
    const config     = getConfig();
    const masterName = config.alpha.master;

    // all alphas except master — fully dynamic
    const otherAlphas = (config.alpha.agents || [])
        .filter(name => name !== masterName)
        .map(name => config.agents[name])
        .filter(Boolean);

    if (!otherAlphas.length) {
        return routeAndForward(deviceId, smsList);
    }

    // null = process locally (master), rest = other alpha URLs
    const allWorkers = [null, ...otherAlphas];
    const sliceSize  = Math.ceil(smsList.length / allWorkers.length);

    const promises = allWorkers.map((url, i) => {
        const slice = smsList.slice(i * sliceSize, (i + 1) * sliceSize);
        if (!slice.length) return Promise.resolve({});
        if (!url) return routeAndForward(deviceId, slice);
        return fetch(`${url}/parse`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ deviceId, sms: slice })
        })
        .then(r => r.ok ? r.json() : {})
        .then(data => data.evidence || {})
        .catch(() => ({}));
    });

    const results = await Promise.all(promises);
    return mergeEvidence(results);
}

module.exports = { routeAndForward, distributeAcrossAlphas, mergeEvidence, classifySms };