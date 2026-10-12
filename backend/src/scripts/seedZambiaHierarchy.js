const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedZambia() {
    console.log('--- Starting Complete Zambia Seeding (Provinces, Districts, Settlements & Properties) ---');

    // 1. Create or update Remis Zambia Holdings & Estates tenant
    const zambiaTenantId = 'tenant-zambia-realty-01';
    const zambiaTenant = await prisma.tenant.upsert({
        where: { id: zambiaTenantId },
        update: {
            name: 'Remis Zambia Holdings & Estates',
            domain: 'remis-zambia',
            status: 'ACTIVE',
            config: {
                country: 'Zambia',
                branding: {
                    logoUrl: '',
                    primaryColor: '#059669',
                    secondaryColor: '#d97706',
                    fontFamily: 'Inter, sans-serif'
                },
                contact: {
                    email: 'operations@remiszambia.co.zm',
                    phone: '+260 211 254 789',
                    address: 'Plot 4821, Thabo Mbeki Road, Mass Media Commercial Park, Lusaka, Zambia'
                },
                locale: {
                    currency: 'ZMW',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h'
                },
                locationLabels: {
                    1: 'Country',
                    2: 'Province',
                    3: 'District',
                    4: 'Settlement / Community'
                }
            },
            features: {
                properties: true,
                leases: true,
                sales: true,
                landlords: true,
                analytics: true,
                locations: true,
                maintenance: true,
                crm: true,
                finance: true,
                documents: true
            }
        },
        create: {
            id: zambiaTenantId,
            name: 'Remis Zambia Holdings & Estates',
            domain: 'remis-zambia',
            status: 'ACTIVE',
            config: {
                country: 'Zambia',
                branding: {
                    logoUrl: '',
                    primaryColor: '#059669',
                    secondaryColor: '#d97706',
                    fontFamily: 'Inter, sans-serif'
                },
                contact: {
                    email: 'operations@remiszambia.co.zm',
                    phone: '+260 211 254 789',
                    address: 'Plot 4821, Thabo Mbeki Road, Mass Media Commercial Park, Lusaka, Zambia'
                },
                locale: {
                    currency: 'ZMW',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h'
                },
                locationLabels: {
                    1: 'Country',
                    2: 'Province',
                    3: 'District',
                    4: 'Settlement / Community'
                }
            },
            features: {
                properties: true,
                leases: true,
                sales: true,
                landlords: true,
                analytics: true,
                locations: true,
                maintenance: true,
                crm: true,
                finance: true,
                documents: true
            }
        }
    });

    console.log('✓ Upserted Zambia Organization:', zambiaTenant.id, zambiaTenant.name);

    // Primary tenant reference (to ensure multi-tenant cross-availability)
    const primaryTenant = await prisma.tenant.findFirst({
        where: { NOT: { id: zambiaTenantId } }
    });
    const tenantsToSeed = [zambiaTenantId];
    if (primaryTenant && primaryTenant.id !== zambiaTenantId) {
        tenantsToSeed.push(primaryTenant.id);
    }

    // 2. Comprehensive Zambia Hierarchy Structure
    const provincesData = [
        {
            code: 'lusaka',
            name: 'Lusaka Province',
            districts: [
                {
                    code: 'lusaka-dist',
                    name: 'Lusaka District',
                    settlements: [
                        'Kabulonga', 'Woodlands', 'Rhodes Park', 'Roma', 'Olympia Park',
                        'Sunningdale', 'Longacres', 'Fairview', 'Northmead', 'Thorn Park',
                        'Villa Elizabetha', 'Avondale', 'Chelstone', 'Ibex Hill', 'Salama Park',
                        'Silverest', 'Chilenje', 'Libala', 'Kabwata', 'Kamwala',
                        'Southgate', 'Lilayi', 'Makeni', 'Matero', 'George Compound',
                        'Kanyama', 'Chawama', 'Garden Compound', 'Mandevu', 'Chipata Compound',
                        'Kalingalinga', 'Mtendere', 'Bauleni'
                    ]
                },
                {
                    code: 'chilanga',
                    name: 'Chilanga District',
                    settlements: ['Mount Makulu', 'Chilanga Central', 'Musamba', 'Parklands Chilanga']
                },
                {
                    code: 'kafue',
                    name: 'Kafue District',
                    settlements: ['Shikoswe', 'Kafue Estates', 'Zambia Compound Kafue', 'Kasanya']
                },
                {
                    code: 'chongwe',
                    name: 'Chongwe District',
                    settlements: ['Chongwe Central', 'Silverest East', 'Chalimbana', 'Kanakantapa']
                },
                {
                    code: 'luangwa',
                    name: 'Luangwa District',
                    settlements: ['Feira', 'Luangwa Boma', 'Kaunga']
                },
                {
                    code: 'chirundu',
                    name: 'Chirundu District',
                    settlements: ['Chirundu Border', 'Highview Chirundu', 'Mission Area']
                },
                {
                    code: 'rufunsa',
                    name: 'Rufunsa District',
                    settlements: ['Rufunsa Boma', 'Mpanshya', 'Chinyunyu Hot Springs']
                },
                {
                    code: 'shibuyunji-lus',
                    name: 'Shibuyunji District',
                    settlements: ['Shibuyunji Boma', 'Nampundwe Mine Community']
                }
            ]
        },
        {
            code: 'copperbelt',
            name: 'Copperbelt Province',
            districts: [
                {
                    code: 'kitwe',
                    name: 'Kitwe District',
                    settlements: [
                        'Riverside', 'Parklands', 'Nkana East', 'Nkana West', 'Chimwemwe',
                        'Kwacha', 'Garneton', 'Mindolo', 'Wusakile', 'Chamboli',
                        'Buchi', 'Luangwa Kitwe', 'Bulangililo', 'Chachacha'
                    ]
                },
                {
                    code: 'ndola',
                    name: 'Ndola District',
                    settlements: [
                        'Kansenshi', 'Northrise', 'Itawa', 'Hillcrest', 'Masala',
                        'Chifubu', 'Lubuto', 'Twapia', 'Mushili', 'Kabushi', 'Kaniki'
                    ]
                },
                {
                    code: 'chingola',
                    name: 'Chingola District',
                    settlements: ['Nchanga North', 'Nchanga South', 'Riverside Chingola', 'Chiwempala', 'Kabundi', 'Kasompe']
                },
                {
                    code: 'mufulira',
                    name: 'Mufulira District',
                    settlements: ['Kantanshi', 'Kamuchanga', 'Fairview Mufulira', 'Kansuswa', 'Eastlea']
                },
                {
                    code: 'luanshya',
                    name: 'Luanshya District',
                    settlements: ['Mikomfwa', 'Roan', 'Mpatamatu', 'New Town Luanshya', 'Town Centre Luanshya']
                },
                {
                    code: 'kalulushi',
                    name: 'Kalulushi District',
                    settlements: ['Chibuluma', 'Kalulushi Central', 'Southdowns', 'Chambishi Township']
                },
                {
                    code: 'chililabombwe',
                    name: 'Chililabombwe District',
                    settlements: ['Konkola', 'Kamenza', 'Lubengele', 'Kakoso', 'Kasumbalesa Border']
                },
                {
                    code: 'lufwanyama',
                    name: 'Lufwanyama District',
                    settlements: ['Lufwanyama Boma', 'Kagem Emerald Belt', 'Chantete']
                },
                {
                    code: 'masaiti',
                    name: 'Masaiti District',
                    settlements: ['Masaiti Boma', 'Kafulafuta', 'Mishikishi']
                },
                {
                    code: 'mpongwe',
                    name: 'Mpongwe District',
                    settlements: ['Mpongwe Central', 'Ibenga Mission', 'Mpongwe Farming Block']
                }
            ]
        },
        {
            code: 'central',
            name: 'Central Province',
            districts: [
                {
                    code: 'kabwe',
                    name: 'Kabwe District',
                    settlements: ['Bwacha', 'Highridge', 'Makululu', 'Chowa', 'Lukanga', 'Ngungu', 'Mine Area Kabwe']
                },
                {
                    code: 'kapiri',
                    name: 'Kapiri Mposhi District',
                    settlements: ['Tazara Township', 'Nkolonga', 'Kapiri Town Centre', 'Riverside Kapiri']
                },
                {
                    code: 'serenje',
                    name: 'Serenje District',
                    settlements: ['Serenje Boma', 'Kanona', 'Mulembo', 'Kundalila Falls Community']
                },
                {
                    code: 'mkushi',
                    name: 'Mkushi District',
                    settlements: ['Mkushi Farming Block', 'Mkushi Central', 'Chalata', 'Upper Lunsemfwa']
                },
                {
                    code: 'chibombo',
                    name: 'Chibombo District',
                    settlements: ['Chibombo Central', 'Liteta', 'Keembe', 'Ipongo']
                },
                {
                    code: 'chisamba',
                    name: 'Chisamba District',
                    settlements: ['Chisamba Town', 'Golden Valley Agricultural Hub', 'Chamuka']
                },
                {
                    code: 'luano',
                    name: 'Luano District',
                    settlements: ['Old Mkushi', 'Luano Valley Center', 'Mboroma']
                },
                {
                    code: 'ngabwe',
                    name: 'Ngabwe District',
                    settlements: ['Ngabwe Boma', 'Kafue Flats North', 'Munyeke']
                },
                {
                    code: 'itezhi-tezhi',
                    name: 'Itezhi-Tezhi District',
                    settlements: ['Itezhi-Tezhi Town', 'Dam View Community', 'Kaanzwa']
                }
            ]
        },
        {
            code: 'southern',
            name: 'Southern Province',
            districts: [
                {
                    code: 'livingstone',
                    name: 'Livingstone District',
                    settlements: ['Dambwa North', 'Dambwa South', 'Maramba', 'Highlands Livingstone', 'Linda', 'Falls View', 'Airport Area', 'Town Centre Livingstone']
                },
                {
                    code: 'choma',
                    name: 'Choma District',
                    settlements: ['Shampande', 'Macha Road', 'Town Centre Choma', 'Riverside Choma', 'Batoka']
                },
                {
                    code: 'mazabuka',
                    name: 'Mazabuka District',
                    settlements: ['Nakambala Sugar Estate', 'Hillside Mazabuka', 'Town Centre Mazabuka', 'Kabobola', 'Nega Nega']
                },
                {
                    code: 'monze',
                    name: 'Monze District',
                    settlements: ['Monze Urban', 'Manunka', 'Bwingi', 'Lochinvar Gate']
                },
                {
                    code: 'kalomo',
                    name: 'Kalomo District',
                    settlements: ['Kalomo Central', 'Mawaya', 'Dundumwezi', 'Siachitembo']
                },
                {
                    code: 'sinazongwe',
                    name: 'Sinazongwe District',
                    settlements: ['Sinazongwe Boma', 'Maamba Coal Mining Town', 'Sinazeze']
                },
                {
                    code: 'siavonga',
                    name: 'Siavonga District',
                    settlements: ['Kariba Lakeside', 'Siavonga Boma', 'High View Siavonga', 'Kalyangile']
                },
                {
                    code: 'kazungula',
                    name: 'Kazungula District',
                    settlements: ['Kazungula Border Village', 'Lumbo', 'Simungoma']
                },
                {
                    code: 'zimba',
                    name: 'Zimba District',
                    settlements: ['Zimba Mission Community', 'Town Centre Zimba']
                },
                {
                    code: 'chikankata',
                    name: 'Chikankata District',
                    settlements: ['Chikankata Mission', 'Turnpike Junction', 'Kafue Gorge Upper']
                },
                {
                    code: 'gwembe',
                    name: 'Gwembe District',
                    settlements: ['Gwembe Boma', 'Chipepo Port', 'Munsi Hot Springs']
                },
                {
                    code: 'namwala',
                    name: 'Namwala District',
                    settlements: ['Namwala Central', 'Baambwe', 'Maala']
                },
                {
                    code: 'pemba',
                    name: 'Pemba District',
                    settlements: ['Pemba Boma', 'Kanchomba Agricultural Center']
                }
            ]
        },
        {
            code: 'eastern',
            name: 'Eastern Province',
            districts: [
                {
                    code: 'chipata',
                    name: 'Chipata District',
                    settlements: ['Kapata', 'Kalongwezi', 'Moth Chipata', 'Mchini', 'Umodzi', 'Little Bombay', 'Nabvutika', 'Magazine']
                },
                {
                    code: 'petauke',
                    name: 'Petauke District',
                    settlements: ['Petauke Urban', 'Showgrounds Petauke', 'Nyika', 'Mingwe']
                },
                {
                    code: 'katete',
                    name: 'Katete District',
                    settlements: ['St. Francis Mission Area', 'Katete Boma', 'Chindwale']
                },
                {
                    code: 'lundazi',
                    name: 'Lundazi District',
                    settlements: ['Castle Area Lundazi', 'Lundazi Urban', 'Chigoma']
                },
                {
                    code: 'nyimba',
                    name: 'Nyimba District',
                    settlements: ['Nyimba Boma', 'Kacholola', 'Vizimumba']
                },
                {
                    code: 'mambwe',
                    name: 'Mambwe District',
                    settlements: ['South Luangwa National Gate', 'Mfuwe Airport Community', 'Masumba']
                },
                {
                    code: 'chadiza',
                    name: 'Chadiza District',
                    settlements: ['Chadiza Central', 'Naviruli', 'Zingalume']
                },
                {
                    code: 'sinda',
                    name: 'Sinda District',
                    settlements: ['Sinda Boma', 'Chassa Mission', 'Ngalowe']
                },
                {
                    code: 'vubwi',
                    name: 'Vubwi District',
                    settlements: ['Vubwi Boma', 'Mbozi']
                },
                {
                    code: 'chasefu',
                    name: 'Chasefu District',
                    settlements: ['Chasefu Center', 'Emusa']
                },
                {
                    code: 'lumezi',
                    name: 'Lumezi District',
                    settlements: ['Lumezi Mission', 'Mwanya']
                },
                {
                    code: 'lusangazi',
                    name: 'Lusangazi District',
                    settlements: ['Lusangazi Boma', 'Ukwimi Community']
                }
            ]
        },
        {
            code: 'luapula',
            name: 'Luapula Province',
            districts: [
                {
                    code: 'mansa',
                    name: 'Mansa District',
                    settlements: ['Kabunda', 'Spark', 'Senama', 'Mansa Central', 'Chilly Mansa']
                },
                {
                    code: 'kawambwa',
                    name: 'Kawambwa District',
                    settlements: ['Kawambwa Tea Estate', 'Kawambwa Central', 'Ntumbachushi Falls Area']
                },
                {
                    code: 'nchelenge',
                    name: 'Nchelenge District',
                    settlements: ['Lake Mweru Harbour', 'Kashikishi Market Town', 'Nchelenge Urban']
                },
                {
                    code: 'samfya',
                    name: 'Samfya District',
                    settlements: ['Lake Bangweulu Beachfront', 'Samfya Urban', 'Chifunabuli Bay']
                },
                {
                    code: 'mwense',
                    name: 'Mwense District',
                    settlements: ['Mwense Boma', 'Musonda Falls Area', 'Mambilima Mission']
                },
                {
                    code: 'chienge',
                    name: 'Chienge District',
                    settlements: ['Chienge Border', 'Puta Central', 'Luchinda']
                },
                {
                    code: 'milenge',
                    name: 'Milenge District',
                    settlements: ['Milenge Boma', 'Sokontwe']
                },
                {
                    code: 'chipili',
                    name: 'Chipili District',
                    settlements: ['Chipili Central', 'Mwenda']
                },
                {
                    code: 'chembe',
                    name: 'Chembe District',
                    settlements: ['Chembe Bridge Border Hub', 'Kundamfumu']
                },
                {
                    code: 'chifunabuli',
                    name: 'Chifunabuli District',
                    settlements: ['Chifunabuli Coast', 'Lubwe Mission']
                },
                {
                    code: 'mwansabombwe',
                    name: 'Mwansabombwe District',
                    settlements: ['Kazembe Royal Capital', 'Lwena']
                },
                {
                    code: 'lunga',
                    name: 'Lunga District',
                    settlements: ['Bangweulu Swamps Island Hub', 'Nsalushi Island']
                }
            ]
        },
        {
            code: 'northern',
            name: 'Northern Province',
            districts: [
                {
                    code: 'kasama',
                    name: 'Kasama District',
                    settlements: ['Kasama Location', 'Newtown Kasama', 'Mulenga Hills', 'Tazara Kasama', 'Chitimukulu Palace Area']
                },
                {
                    code: 'mbala',
                    name: 'Mbala District',
                    settlements: ['Lake Chila Area', 'Mbala Central', 'Moto Moto Museum Area']
                },
                {
                    code: 'mpulungu',
                    name: 'Mpulungu District',
                    settlements: ['Lake Tanganyika International Port', 'Harbour View', 'Mpulungu Urban', 'Kalambo Falls Gateway']
                },
                {
                    code: 'mporokoso',
                    name: 'Mporokoso District',
                    settlements: ['Mporokoso Boma', 'Lumangwe Falls Community']
                },
                {
                    code: 'luwingu',
                    name: 'Luwingu District',
                    settlements: ['Luwingu Central', 'Chaba Lake Point']
                },
                {
                    code: 'kaputa',
                    name: 'Kaputa District',
                    settlements: ['Lake Mweru Wantipa Shore', 'Kaputa Boma']
                },
                {
                    code: 'chilubi',
                    name: 'Chilubi District',
                    settlements: ['Chilubi Island Hub', 'Santa Maria Mission']
                },
                {
                    code: 'mungwi',
                    name: 'Mungwi District',
                    settlements: ['Mungwi Boma', 'Malole Mission']
                },
                {
                    code: 'senga-hill',
                    name: 'Senga Hill District',
                    settlements: ['Senga Hill Boma', 'Nondo']
                },
                {
                    code: 'lunte',
                    name: 'Lunte District',
                    settlements: ['Lunte Boma', 'Kapatu Mission']
                }
            ]
        },
        {
            code: 'northwestern',
            name: 'North-Western Province',
            districts: [
                {
                    code: 'solwezi',
                    name: 'Solwezi District',
                    settlements: ['Kansanshi Mine Town', 'Kyawama', 'Messenger Solwezi', 'Kimasala', 'Kazomba', 'Rodger Chinense']
                },
                {
                    code: 'kalumbila',
                    name: 'Kalumbila District',
                    settlements: ['Trident Mining Town', 'Sentinel Village', 'Kisasa']
                },
                {
                    code: 'kasempa',
                    name: 'Kasempa District',
                    settlements: ['Kasempa Boma', 'Mukinge Mission Hospital Area']
                },
                {
                    code: 'mwinilunga',
                    name: 'Mwinilunga District',
                    settlements: ['Source of the Zambezi Monument Area', 'Mwinilunga Urban', 'Kakoma']
                },
                {
                    code: 'zambezi',
                    name: 'Zambezi District',
                    settlements: ['Zambezi Boma', 'Chitokoloki Mission', 'Dipalata']
                },
                {
                    code: 'kabompo',
                    name: 'Kabompo District',
                    settlements: ['Kabompo Boma', 'Chikonkwelo', 'Kayombo']
                },
                {
                    code: 'chavuma',
                    name: 'Chavuma District',
                    settlements: ['Chavuma Falls Community', 'Chavuma Border Post']
                },
                {
                    code: 'mufumbwe',
                    name: 'Mufumbwe District',
                    settlements: ['Mufumbwe Boma', 'Kamankundju']
                },
                {
                    code: 'ikelenge',
                    name: 'Ikelenge District',
                    settlements: ['Ikelenge Pineapple Agricultural Belt', 'Zambezi Rapids']
                },
                {
                    code: 'mushindamo',
                    name: 'Mushindamo District',
                    settlements: ['Mushindamo Boma', 'Kipushi Border Hub']
                },
                {
                    code: 'manyinga',
                    name: 'Manyinga District',
                    settlements: ['Manyinga Boma', 'Loloma Mission']
                }
            ]
        },
        {
            code: 'muchinga',
            name: 'Muchinga Province',
            districts: [
                {
                    code: 'chinsali',
                    name: 'Chinsali District',
                    settlements: ['Chinsali Boma', 'Lubwa Mission Historic Center']
                },
                {
                    code: 'mpika',
                    name: 'Mpika District',
                    settlements: ['Tazara Railway Workshops', 'Chitulika', 'Mpika Urban', 'Danger Hill Corridor']
                },
                {
                    code: 'nakonde',
                    name: 'Nakonde District',
                    settlements: ['Tanzania Border One-Stop Post', 'Nakonde Urban', 'Wulongo']
                },
                {
                    code: 'isoka',
                    name: 'Isoka District',
                    settlements: ['Isoka Urban', 'Kapililonga', 'Mpundu']
                },
                {
                    code: 'mafinga',
                    name: 'Mafinga District',
                    settlements: ['Thendele Central', 'Mafinga Hills Base']
                },
                {
                    code: 'shiwangandu',
                    name: 'Shiwang\'andu District',
                    settlements: ['Shiwa Ng\'andu Historic Estate', 'Kapishya Natural Hot Springs']
                },
                {
                    code: 'lavushimanda',
                    name: 'Lavushimanda District',
                    settlements: ['Lavushi Manda National Park Entrance', 'Lulimala']
                },
                {
                    code: 'kanchibiya',
                    name: 'Kanchibiya District',
                    settlements: ['Kanchibiya Boma', 'Chalabesa Mission']
                }
            ]
        },
        {
            code: 'western',
            name: 'Western Province',
            districts: [
                {
                    code: 'mongu',
                    name: 'Mongu District',
                    settlements: ['Limulunga Royal Palace', 'Mandanga', 'Blue Sky Mongu', 'Mongu Central', 'Imwiko', 'Malengwa']
                },
                {
                    code: 'kaoma',
                    name: 'Kaoma District',
                    settlements: ['Kaoma Urban', 'Mulamatila', 'Luampa Road Hub']
                },
                {
                    code: 'senanga',
                    name: 'Senanga District',
                    settlements: ['Senanga Boma', 'Zambezi River Esplanade', 'Litambwa']
                },
                {
                    code: 'sesheke',
                    name: 'Sesheke District',
                    settlements: ['Katima Mulilo International Border', 'Sesheke Urban', 'Mwandi Junction']
                },
                {
                    code: 'kalabo',
                    name: 'Kalabo District',
                    settlements: ['Liuwa Plain National Park Gate', 'Kalabo Urban', 'Tapalo']
                },
                {
                    code: 'lukulu',
                    name: 'Lukulu District',
                    settlements: ['Lukulu Boma', 'Sanctuary Point']
                },
                {
                    code: 'shangombo',
                    name: 'Shangombo District',
                    settlements: ['Angola Frontier Post', 'Shangombo Boma']
                },
                {
                    code: 'nalolo',
                    name: 'Nalolo District',
                    settlements: ['Muoyo Royal Sub-Capital', 'Nalolo Boma']
                },
                {
                    code: 'sioma',
                    name: 'Sioma District',
                    settlements: ['Ngonye Falls Community', 'Sioma Boma']
                },
                {
                    code: 'luampa',
                    name: 'Luampa District',
                    settlements: ['Luampa Mission Hospital Community']
                },
                {
                    code: 'mitete',
                    name: 'Mitete District',
                    settlements: ['Mitete Boma', 'Washishi']
                },
                {
                    code: 'mwandi',
                    name: 'Mwandi District',
                    settlements: ['Mwandi Royal Kuta', 'Mwandi Urban']
                },
                {
                    code: 'sikongo',
                    name: 'Sikongo District',
                    settlements: ['Sikongo Border Town']
                },
                {
                    code: 'nkeyema',
                    name: 'Nkeyema District',
                    settlements: ['Nkeyema Tobacco & Commercial Farming Belt', 'TBZ Scheme']
                }
            ]
        }
    ];

    let totalCreated = 0;

    // Seed for each designated tenant
    for (const tid of tenantsToSeed) {
        console.log(`\nSeeding Zambia locations for tenant [${tid}]...`);

        // Level 1: Country
        const countryId = `loc-zm-${tid.slice(0, 8)}-root`;
        const country = await prisma.location.upsert({
            where: { id: countryId },
            update: { name: 'Zambia', type: 'COUNTRY', level: 1 },
            create: {
                id: countryId,
                name: 'Zambia',
                type: 'COUNTRY',
                level: 1,
                parentId: null,
                tenantId: tid
            }
        });
        totalCreated++;

        // Loop over Provinces
        for (const prov of provincesData) {
            const provId = `loc-zm-${tid.slice(0, 6)}-${prov.code}`;
            const province = await prisma.location.upsert({
                where: { id: provId },
                update: { name: prov.name, type: 'PROVINCE', level: 2, parentId: country.id },
                create: {
                    id: provId,
                    name: prov.name,
                    type: 'PROVINCE',
                    level: 2,
                    parentId: country.id,
                    tenantId: tid
                }
            });
            totalCreated++;

            // Loop over Districts
            for (const dist of prov.districts) {
                const distId = `loc-zm-${tid.slice(0, 6)}-${dist.code}`;
                const district = await prisma.location.upsert({
                    where: { id: distId },
                    update: { name: dist.name, type: 'DISTRICT', level: 3, parentId: province.id },
                    create: {
                        id: distId,
                        name: dist.name,
                        type: 'DISTRICT',
                        level: 3,
                        parentId: province.id,
                        tenantId: tid
                    }
                });
                totalCreated++;

                // Loop over Settlements / Communities
                for (const sett of dist.settlements) {
                    const slug = sett.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
                    const settId = `loc-zm-${tid.slice(0, 4)}-${dist.code.slice(0, 8)}-${slug}`;
                    await prisma.location.upsert({
                        where: { id: settId },
                        update: { name: sett, type: 'COMMUNITY', level: 4, parentId: district.id },
                        create: {
                            id: settId,
                            name: sett,
                            type: 'COMMUNITY',
                            level: 4,
                            parentId: district.id,
                            tenantId: tid
                        }
                    });
                    totalCreated++;
                }
            }
        }
    }

    console.log(`✓ Processed ${totalCreated} total location entities across all 10 Zambian provinces!`);

    // 3. Seed Premier Zambian Properties for Remis Zambia Holdings
    console.log('\n--- Seeding Premier Zambian Properties & GPS Coordinates ---');

    // Find the Kabulonga, Rhodes Park, Woodlands, Riverside, and Livingstone locations
    const kabulongaLoc = await prisma.location.findFirst({
        where: { name: 'Kabulonga', tenantId: zambiaTenantId }
    });
    const rhodesParkLoc = await prisma.location.findFirst({
        where: { name: 'Rhodes Park', tenantId: zambiaTenantId }
    });
    const woodlandsLoc = await prisma.location.findFirst({
        where: { name: 'Woodlands', tenantId: zambiaTenantId }
    });
    const riversideKitweLoc = await prisma.location.findFirst({
        where: { name: 'Riverside', tenantId: zambiaTenantId }
    });
    const kansenshiNdolaLoc = await prisma.location.findFirst({
        where: { name: 'Kansenshi', tenantId: zambiaTenantId }
    });
    const livingstoneFallsLoc = await prisma.location.findFirst({
        where: { name: 'Falls View', tenantId: zambiaTenantId }
    });

    const sampleProperties = [
        {
            id: 'prop-zm-kabulonga-01',
            name: 'Kabulonga Diplomatic Presidential Villa',
            type: 'RESIDENTIAL',
            status: 'AVAILABLE',
            locationId: kabulongaLoc?.id || 'loc-zm-lusaka',
            tenantId: zambiaTenantId,
            address: 'Plot 12, Kudu Road, Kabulonga, Lusaka',
            latitude: -15.4212,
            longitude: 28.3415,
            province: 'Lusaka Province',
            district: 'Lusaka District',
            llg: 'Kabulonga',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            id: 'prop-zm-rhodespark-02',
            name: 'Rhodes Park Corporate Financial Plaza',
            type: 'COMMERCIAL',
            status: 'AVAILABLE',
            locationId: rhodesParkLoc?.id || 'loc-zm-lusaka',
            tenantId: zambiaTenantId,
            address: 'Corner of Addis Ababa Drive & Great East Road, Rhodes Park, Lusaka',
            latitude: -15.4120,
            longitude: 28.3005,
            province: 'Lusaka Province',
            district: 'Lusaka District',
            llg: 'Rhodes Park',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            id: 'prop-zm-woodlands-03',
            name: 'Woodlands Lifestyle Estate & Townhouses',
            type: 'RESIDENTIAL',
            status: 'OCCUPIED',
            locationId: woodlandsLoc?.id || 'loc-zm-lusaka',
            tenantId: zambiaTenantId,
            address: 'Woodlands Chalala Boulevard, Lusaka',
            latitude: -15.4410,
            longitude: 28.3320,
            province: 'Lusaka Province',
            district: 'Lusaka District',
            llg: 'Woodlands',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            id: 'prop-zm-kitwe-riverside-04',
            name: 'Copperbelt Riverside Executive Towers',
            type: 'COMMERCIAL',
            status: 'AVAILABLE',
            locationId: riversideKitweLoc?.id || 'loc-zm-copperbelt',
            tenantId: zambiaTenantId,
            address: 'Jambo Drive, Riverside, Kitwe',
            latitude: -12.7910,
            longitude: 28.2310,
            province: 'Copperbelt Province',
            district: 'Kitwe District',
            llg: 'Riverside',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            id: 'prop-zm-ndola-kansenshi-05',
            name: 'Kansenshi Gated Residential Court',
            type: 'RESIDENTIAL',
            status: 'AVAILABLE',
            locationId: kansenshiNdolaLoc?.id || 'loc-zm-copperbelt',
            tenantId: zambiaTenantId,
            address: 'Broadway Way, Kansenshi, Ndola',
            latitude: -12.9810,
            longitude: 28.6210,
            province: 'Copperbelt Province',
            district: 'Ndola District',
            llg: 'Kansenshi',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            id: 'prop-zm-livingstone-falls-06',
            name: 'Victoria Falls Royal Safari Lodge & Residences',
            type: 'HOSPITALITY',
            status: 'AVAILABLE',
            locationId: livingstoneFallsLoc?.id || 'loc-zm-southern',
            tenantId: zambiaTenantId,
            address: 'Mosi-oa-Tunya Way, Falls View, Livingstone',
            latitude: -17.8510,
            longitude: 25.8610,
            province: 'Southern Province',
            district: 'Livingstone District',
            llg: 'Falls View',
            region: 'Southern Central Africa',
            images: [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
            ]
        }
    ];

    for (const prop of sampleProperties) {
        await prisma.property.upsert({
            where: { id: prop.id },
            update: prop,
            create: prop
        });
        console.log(`✓ Seeded Zambian Property: ${prop.name} (${prop.address})`);
    }

    console.log('\n======================================================');
    console.log('🎉 SUCCESS: All 10 Zambia Provinces, Districts, Settlements,');
    console.log('   Properties & Remis Zambia Holdings Organization Seeded!');
    console.log('======================================================\n');
}

seedZambia()
    .catch(e => {
        console.error('Error seeding Zambia:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
