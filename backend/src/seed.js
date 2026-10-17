import crypto from 'crypto';import {get,run,tx} from './db.js';
/** First-boot content: the Force One facts supplied by the owner. Every value is editable from the admin panel. */
const vehicle={name:'Force One',model:'Force One SUV',launchYear:'2011',discontinued:'Around 2016–2018',priceRange:'₹8.72 – ₹15.27 Lakh (ex-showroom, last recorded)',driveType:'RWD / 4WD',chassis:'Traditional ladder-frame',
  engine:'2.2L FMTECH common-rail turbo diesel (Mercedes-Benz licensed OM611)',power:'139 bhp @ 3,800 rpm',torque:'321 Nm @ 1,600–2,400 rpm',transmission:'5-speed manual',fuelType:'Diesel',mileage:'11.6 kmpl (ARAI)',seatingCapacity:'7 seater (6-seater option)',
  length:'4,860 mm',width:'1,780 mm',height:'1,935 – 1,985 mm',wheelbase:'3,025 mm',groundClearance:'205 mm',
  suspension:'Independent double-wishbone front, multi-link rear — tuned by Lotus Engineering',tyres:'235/70 R16 (EX, SX) · 245/70 R16 all-terrain (LX)'};
const variants=[
 {order:1,name:'EX',tier:'Base trim',tagline:'Built for fleets and rural roads.',engine:'2.6L direct-injection turbo diesel (BS-III)',power:'80 bhp',torque:'230 Nm',drivetrain:'',wheels:'16-inch alloys · 235/70 R16',
  description:'Aimed at commercial fleet operators and rural markets, with a simpler 2.6-litre OM616-based engine.',highlights:'Simpler BS-III compliant engine\nTargeted at commercial fleets & rural buyers\n16-inch alloy wheels, 235/70 R16 tyres'},
 {order:2,name:'SX',tier:'Mid trim',tagline:'The mainstream passenger Force One.',engine:'2.2L FMTECH common-rail turbo diesel (Mercedes-Benz licensed)',power:'139 bhp',torque:'321 Nm',drivetrain:'',wheels:'16-inch alloys · 235/70 R16',
  description:'The mainstream passenger model, with premium features meant to compete with the premium SUVs of its time.',highlights:'Leather seats in 6- or 7-seat layouts\nRoof-mounted AC vents for all three rows\nProgressive cruise control & Multi-Information Display\nABS with EBD and rear parking sensors'},
 {order:3,name:'LX',tier:'Top trim',tagline:'Everything in SX — plus real 4×4.',engine:'2.2L FMTECH common-rail turbo diesel (Mercedes-Benz licensed)',power:'139 bhp',torque:'321 Nm',drivetrain:'4×4 with electronic shift-on-the-fly & Limited Slip Differential',wheels:'16-inch alloys · 245/70 R16 all-terrain',
  description:'Retains everything from the SX and adds a robust four-wheel-drive system for off-roading.',highlights:'Electronic shift-on-the-fly 4×4\nLimited Slip Differential (LSD)\nWider 245/70 R16 all-terrain tyres\nAll SX comfort and safety features'}];
const F=(order,category,icon,title,description)=>({order,category,icon,title,description});
const features=[
 F(1,'DESIGN','Palette','Wide chrome grille','Flanked by halogen projector headlamps with integrated LED daytime running lights.'),
 F(2,'DESIGN','Compass','Rugged side profile','Electrically adjustable ORVMs with integrated LED turn indicators, rugged side-steps and prominent roof rails.'),
 F(3,'DESIGN','Shield','Ladder-frame stance','A massive, imposing presence built over a traditional ladder-frame chassis.'),
 F(4,'DESIGN','Gauge','Wheels & tyres','16-inch alloys with 235/70 R16 tyres on EX and SX; the LX steps up to wider 245/70 R16 all-terrain tyres.'),
 F(5,'INTERIOR','Sofa','Leather seating','Leather upholstery in a 6-seater layout with captain chairs in the middle row, or a traditional 7-seater bench.'),
 F(6,'COMFORT','Zap','True multi-zone AC','Roof-mounted vents for all three rows, each with independent controls.'),
 F(7,'COMFORT','Gauge','Cruise control & MID','Progressive cruise control and a Multi-Information Display tracking trip statistics and service intervals.'),
 F(8,'COMFORT','Users','Infotainment','A 2-DIN audio system with Bluetooth connectivity and steering-mounted media controls.'),
 F(9,'PERFORMANCE','Fuel','Mercedes-licensed diesel','The 2.2-litre FMTECH common-rail turbo diesel makes 139 bhp and 321 Nm, paired with a 5-speed manual.'),
 F(10,'PERFORMANCE','Compass','Lotus-tuned ride & handling','Independent double-wishbone front and multi-link rear suspension, tuned by Lotus Engineering (UK) for high-speed highway stability.'),
 F(11,'PERFORMANCE','Wrench','4×4 shift-on-the-fly (LX)','Electronic shift-on-the-fly four-wheel drive with a Limited Slip Differential for off-roading.'),
 F(12,'SAFETY','Shield','ABS with EBD','Anti-lock braking with electronic brake-force distribution on SX and LX trims.'),
 F(13,'SAFETY','Shield','Parking sensors & keyless entry','Rear parking sensors in the bumper, plus remote keyless entry on higher trims.'),
 F(14,'SAFETY','Zap','Smart instrument warnings','Brake-pad wear indicator, driver seatbelt reminder and over-speed warnings.'),
 F(15,'UTILITY','Luggage','Three rows, real ground clearance','Seats up to seven, with 205 mm of ground clearance and a 3,025 mm wheelbase.')];
export function seedIfEmpty(){
  if(!get("select 1 from meta where key='hero_title_v2'")){ // v2: the hero headline is now just "FORCE ONE"
    const h=get("select value from settings where key='hero'");if(h){const o=JSON.parse(h.value);if(!o.title||/^my force one$/i.test(o.title.trim())){o.title='FORCE ONE';run("update settings set value=? where key='hero'",JSON.stringify(o))}}
    const st=get("select value from settings where key='site'");if(st){const o=JSON.parse(st.value);if(/^my force one$/i.test((o.title||'').trim())){o.title='Force One';run("update settings set value=? where key='site'",JSON.stringify(o))}}
    run("insert into meta(key,value) values('hero_title_v2','1')")}
  if(get("select 1 from meta where key='seeded'"))return;
  tx(()=>{const set=(k,v)=>run('insert or ignore into settings(key,value) values(?,?)',k,JSON.stringify(v));
    set('vehicle',vehicle);set('hero',{title:'FORCE ONE',subtitle:'Built for the journey.',overlay:45});
    set('site',{title:'Force One',description:'A personal showcase of one Force One — launched in 2011, built for the journey.',showServices:false,showRegistration:false});
    set('about',{heading:'About',body:'The Force One SUV offered a mixture of rugged underpinnings and premium features for its era, highly influenced by European engineering.\nThis site is the personal garage of one Force One — its photos, films, journeys and memories.'});
    set('copy',{});
    for(const v of variants)run('insert into items(id,type,data) values(?,?,?)',crypto.randomUUID(),'variant',JSON.stringify(v));
    for(const f of features)run('insert into items(id,type,data) values(?,?,?)',crypto.randomUUID(),'feature',JSON.stringify(f));
    run("insert into meta(key,value) values('seeded','1')")});console.log('Seeded Force One data')}
