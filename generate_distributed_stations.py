import json
import random

# 2025 Türkiye EV dağılımına göre şehir yoğunlukları
EV_DISTRIBUTION_2025 = {
    'İstanbul': 350,  # Artırdık - büyük şehir
    'Ankara': 150,    # Artırdık
    'İzmir': 120,     # Artırdık
    'Antalya': 80,
    'Bursa': 70,
    'Kocaeli': 60,
    'Muğla': 55,
    'Adana': 50,
    'Mersin': 45,
    'Konya': 40,
    'Aydın': 35,
    'Balıkesir': 30,
    'Eskişehir': 30,
    'Denizli': 25,
    'Gaziantep': 25,
    'Kayseri': 20,
    'Tekirdağ': 20,
    'Manisa': 18,
    'Sakarya': 18,
    'Çanakkale': 15
}

# Her şehir için GERÇEK mahalle, ilçe ve lokasyonlar
DETAILED_LOCATIONS = {
    'İstanbul': [
        # Avrupa Yakası - Farklı İlçeler
        {'name': 'Bağcılar Meydan AVM', 'lat': 41.0392, 'lng': 28.8576, 'district': 'Bağcılar'},
        {'name': 'Güngören Güven Park', 'lat': 41.0234, 'lng': 28.8734, 'district': 'Güngören'},
        {'name': 'Bahçelievler Metro İstasyonu', 'lat': 41.0012, 'lng': 28.8523, 'district': 'Bahçelievler'},
        {'name': 'Esenler Otobüs Terminali', 'lat': 41.0478, 'lng': 28.8812, 'district': 'Esenler'},
        {'name': 'Küçükçekmece Halkalı', 'lat': 41.0156, 'lng': 28.6234, 'district': 'Küçükçekmece'},
        {'name': 'Avcılar Ambarlı Yolu', 'lat': 40.9834, 'lng': 28.7312, 'district': 'Avcılar'},
        {'name': 'Beylikdüzü Migros AVM', 'lat': 41.0042, 'lng': 28.6499, 'district': 'Beylikdüzü'},
        {'name': 'Esenyurt Marmara Park AVM', 'lat': 41.0312, 'lng': 28.6734, 'district': 'Esenyurt'},
        {'name': 'Büyükçekmece Mimarsinan', 'lat': 41.0223, 'lng': 28.5845, 'district': 'Büyükçekmece'},
        {'name': 'Bakırköy Capacity AVM', 'lat': 40.9807, 'lng': 28.8734, 'district': 'Bakırköy'},
        {'name': 'Zeytinburnu Olivium AVM', 'lat': 41.0045, 'lng': 28.9012, 'district': 'Zeytinburnu'},
        {'name': 'Fatih Çapa', 'lat': 41.0189, 'lng': 28.9423, 'district': 'Fatih'},
        {'name': 'Eyüpsultan Çırçır', 'lat': 41.0567, 'lng': 28.9189, 'district': 'Eyüpsultan'},
        {'name': 'Gaziosmanpaşa Metro İstasyonu', 'lat': 41.0678, 'lng': 28.9056, 'district': 'Gaziosmanpaşa'},
        {'name': 'Sultangazi Cebeci', 'lat': 41.1012, 'lng': 28.8623, 'district': 'Sultangazi'},
        {'name': 'Başakşehir Metrokent', 'lat': 41.0923, 'lng': 28.8045, 'district': 'Başakşehir'},
        {'name': 'Arnavutköy Hadımköy', 'lat': 41.1456, 'lng': 28.6234, 'district': 'Arnavutköy'},
        {'name': 'Çatalca Merkez', 'lat': 41.1423, 'lng': 28.4612, 'district': 'Çatalca'},
        {'name': 'Silivri Selimpaşa', 'lat': 41.0734, 'lng': 28.2456, 'district': 'Silivri'},
        {'name': 'Beyoğlu Taksim', 'lat': 41.0370, 'lng': 28.9857, 'district': 'Beyoğlu'},
        {'name': 'Şişli Mecidiyeköy', 'lat': 41.0649, 'lng': 28.9938, 'district': 'Şişli'},
        {'name': 'Beşiktaş Barbaros', 'lat': 41.0426, 'lng': 29.0076, 'district': 'Beşiktaş'},
        {'name': 'Sarıyer İstinye Park', 'lat': 41.1089, 'lng': 29.0550, 'district': 'Sarıyer'},
        {'name': 'Kağıthane Çağlayan', 'lat': 41.0756, 'lng': 28.9789, 'district': 'Kağıthane'},
        {'name': 'Beylikdüzü Yaşam Vadisi', 'lat': 41.0123, 'lng': 28.6678, 'district': 'Beylikdüzü'},
        
        # Anadolu Yakası - Farklı İlçeler
        {'name': 'Kadıköy Moda', 'lat': 40.9920, 'lng': 29.0270, 'district': 'Kadıköy'},
        {'name': 'Maltepe Park Mavişehir', 'lat': 40.9356, 'lng': 29.1456, 'district': 'Maltepe'},
        {'name': 'Kartal Yakacık', 'lat': 40.9089, 'lng': 29.1823, 'district': 'Kartal'},
        {'name': 'Pendik Kaynarca', 'lat': 40.8718, 'lng': 29.2361, 'district': 'Pendik'},
        {'name': 'Tuzla DESİAD', 'lat': 40.8234, 'lng': 29.2978, 'district': 'Tuzla'},
        {'name': 'Ümraniye Finans Merkezi', 'lat': 41.0256, 'lng': 29.1089, 'district': 'Ümraniye'},
        {'name': 'Ataşehir Palladium', 'lat': 40.9823, 'lng': 29.1245, 'district': 'Ataşehir'},
        {'name': 'Üsküdar Kısıklı', 'lat': 41.0234, 'lng': 29.0312, 'district': 'Üsküdar'},
        {'name': 'Beykoz Çubuklu', 'lat': 41.1234, 'lng': 29.0923, 'district': 'Beykoz'},
        {'name': 'Çekmeköy Merkez', 'lat': 41.0323, 'lng': 29.1734, 'district': 'Çekmeköy'},
        {'name': 'Sancaktepe Samandıra', 'lat': 41.0145, 'lng': 29.2156, 'district': 'Sancaktepe'},
        {'name': 'Sultanbeyli Merkez', 'lat': 40.9612, 'lng': 29.2634, 'district': 'Sultanbeyli'},
        {'name': 'Şile Merkez', 'lat': 41.1756, 'lng': 29.6178, 'district': 'Şile'},
        {'name': 'Adalar Büyükada', 'lat': 40.8623, 'lng': 29.1234, 'district': 'Adalar'},
        {'name': 'Kartal Soğanlık', 'lat': 40.8934, 'lng': 29.2045, 'district': 'Kartal'},
        
        # Otoyol ve Kavşaklar
        {'name': 'TEM Otoyolu Hadımköy', 'lat': 41.1234, 'lng': 28.6512, 'district': 'Arnavutköy'},
        {'name': 'E-5 Kartal Kavşağı', 'lat': 40.9145, 'lng': 29.1934, 'district': 'Kartal'},
        {'name': 'Kuzey Marmara Otoyolu Göktürk', 'lat': 41.1678, 'lng': 28.8634, 'district': 'Eyüpsultan'},
        {'name': 'Büyükçekmece TEM', 'lat': 41.0456, 'lng': 28.5612, 'district': 'Büyükçekmece'},
        {'name': 'Avcılar E-5', 'lat': 40.9868, 'lng': 28.7197, 'district': 'Avcılar'},
    ],
    
    'Ankara': [
        {'name': 'Çankaya Kızılay', 'lat': 39.9194, 'lng': 32.8540, 'district': 'Çankaya'},
        {'name': 'Keçiören Merkez', 'lat': 39.9678, 'lng': 32.8712, 'district': 'Keçiören'},
        {'name': 'Yenimahalle Demetevler', 'lat': 39.9456, 'lng': 32.7834, 'district': 'Yenimahalle'},
        {'name': 'Etimesgut Eryaman', 'lat': 39.9512, 'lng': 32.6834, 'district': 'Etimesgut'},
        {'name': 'Mamak Durali Alıç', 'lat': 39.9234, 'lng': 32.9123, 'district': 'Mamak'},
        {'name': 'Sincan Organize Sanayi', 'lat': 39.9723, 'lng': 32.5812, 'district': 'Sincan'},
        {'name': 'Pursaklar Saray', 'lat': 40.0312, 'lng': 32.9045, 'district': 'Pursaklar'},
        {'name': 'Altındağ Ulus', 'lat': 39.9447, 'lng': 32.8597, 'district': 'Altındağ'},
        {'name': 'Gölbaşı Mogan Gölü', 'lat': 39.7923, 'lng': 32.8156, 'district': 'Gölbaşı'},
        {'name': 'Polatlı Merkez', 'lat': 39.5812, 'lng': 32.1423, 'district': 'Polatlı'},
        {'name': 'Çamlıdere Yolu', 'lat': 40.0456, 'lng': 32.4678, 'district': 'Çamlıdere'},
        {'name': 'Beypazarı Merkez', 'lat': 40.1689, 'lng': 31.9212, 'district': 'Beypazarı'},
        {'name': 'Çubuk Merkez', 'lat': 40.2378, 'lng': 33.0234, 'district': 'Çubuk'},
        {'name': 'Elmadağ Merkez', 'lat': 39.9212, 'lng': 33.2345, 'district': 'Elmadağ'},
        {'name': 'Ankara Garı', 'lat': 39.9369, 'lng': 32.8519, 'district': 'Altındağ'},
    ],
    
    'İzmir': [
        {'name': 'Konak Alsancak', 'lat': 38.4392, 'lng': 27.1478, 'district': 'Konak'},
        {'name': 'Karşıyaka İskelesi', 'lat': 38.4623, 'lng': 27.1089, 'district': 'Karşıyaka'},
        {'name': 'Bornova Forum', 'lat': 38.4489, 'lng': 27.2134, 'district': 'Bornova'},
        {'name': 'Buca Evka 3', 'lat': 38.3923, 'lng': 27.1756, 'district': 'Buca'},
        {'name': 'Gaziemir İzmir Ekonomi Üniversitesi', 'lat': 38.3234, 'lng': 27.1512, 'district': 'Gaziemir'},
        {'name': 'Balçova Teleferik', 'lat': 38.3812, 'lng': 27.0456, 'district': 'Balçova'},
        {'name': 'Çiğli Sasalı', 'lat': 38.5023, 'lng': 27.0312, 'district': 'Çiğli'},
        {'name': 'Bayraklı Mavişehir', 'lat': 38.4756, 'lng': 27.1612, 'district': 'Bayraklı'},
        {'name': 'Urla Merkez', 'lat': 38.3234, 'lng': 26.7645, 'district': 'Urla'},
        {'name': 'Çeşme Ilıca', 'lat': 38.3267, 'lng': 26.3689, 'district': 'Çeşme'},
        {'name': 'Karabağlar Metro İstasyonu', 'lat': 38.3745, 'lng': 27.1234, 'district': 'Karabağlar'},
        {'name': 'Narlıdere Sahil', 'lat': 38.3956, 'lng': 27.0234, 'district': 'Narlıdere'},
    ],
    
    'Antalya': [
        {'name': 'Muratpaşa Migros AVM', 'lat': 36.8978, 'lng': 30.7123, 'district': 'Muratpaşa'},
        {'name': 'Kepez TerraCity', 'lat': 36.9456, 'lng': 30.7345, 'district': 'Kepez'},
        {'name': 'Konyaaltı Sahil', 'lat': 36.8745, 'lng': 30.6289, 'district': 'Konyaaltı'},
        {'name': 'Alanya Cleopatra Beach', 'lat': 36.5439, 'lng': 32.0000, 'district': 'Alanya'},
        {'name': 'Manavgat Şelale', 'lat': 36.7889, 'lng': 31.4423, 'district': 'Manavgat'},
        {'name': 'Serik Belek', 'lat': 36.8634, 'lng': 31.0823, 'district': 'Serik'},
        {'name': 'Aksu Lara', 'lat': 36.8345, 'lng': 30.8456, 'district': 'Aksu'},
        {'name': 'Döşemealtı Korkuteli Yolu', 'lat': 36.9912, 'lng': 30.5923, 'district': 'Döşemealtı'},
    ],
    
    'Bursa': [
        {'name': 'Osmangazi Korupark', 'lat': 40.2089, 'lng': 29.0234, 'district': 'Osmangazi'},
        {'name': 'Nilüfer Görükle', 'lat': 40.1826, 'lng': 29.0665, 'district': 'Nilüfer'},
        {'name': 'Yıldırım Setbaşı', 'lat': 40.1789, 'lng': 29.1123, 'district': 'Yıldırım'},
        {'name': 'Mudanya Sahil', 'lat': 40.3756, 'lng': 28.8834, 'district': 'Mudanya'},
        {'name': 'Gemlik Liman', 'lat': 40.4312, 'lng': 29.1567, 'district': 'Gemlik'},
        {'name': 'İnegöl Merkez', 'lat': 40.0789, 'lng': 29.5123, 'district': 'İnegöl'},
        {'name': 'Kestel Organize Sanayi', 'lat': 40.1956, 'lng': 29.2134, 'district': 'Kestel'},
        {'name': 'Osmangazi Zafer Plaza', 'lat': 40.1923, 'lng': 29.0612, 'district': 'Osmangazi'},
        {'name': 'Nilüfer Özlüce', 'lat': 40.2123, 'lng': 28.9845, 'district': 'Nilüfer'},
        {'name': 'Yıldırım Heykel', 'lat': 40.1845, 'lng': 29.0678, 'district': 'Yıldırım'},
    ],
    
    'Kocaeli': [
        {'name': 'İzmit Center AVM', 'lat': 40.7654, 'lng': 29.9403, 'district': 'İzmit'},
        {'name': 'Gebze Gebze AVM', 'lat': 40.8023, 'lng': 29.4312, 'district': 'Gebze'},
        {'name': 'Gölcük Marinası', 'lat': 40.7156, 'lng': 29.8178, 'district': 'Gölcük'},
        {'name': 'Derince Liman', 'lat': 40.7523, 'lng': 29.8512, 'district': 'Derince'},
        {'name': 'Körfez Merkez', 'lat': 40.7712, 'lng': 29.7534, 'district': 'Körfez'},
        {'name': 'Çayırova OSB', 'lat': 40.8234, 'lng': 29.3812, 'district': 'Çayırova'},
        {'name': 'Kartepe Kayak Merkezi', 'lat': 40.7234, 'lng': 30.0812, 'district': 'Kartepe'},
        {'name': 'Başiskele Yuvacık', 'lat': 40.7812, 'lng': 29.8945, 'district': 'Başiskele'},
    ],
    
    'Muğla': [
        {'name': 'Bodrum Merkez', 'lat': 37.0344, 'lng': 27.4305, 'district': 'Bodrum'},
        {'name': 'Marmaris İskele', 'lat': 36.8535, 'lng': 28.2744, 'district': 'Marmaris'},
        {'name': 'Fethiye Çalış', 'lat': 36.6223, 'lng': 29.1134, 'district': 'Fethiye'},
        {'name': 'Milas Havalimanı', 'lat': 37.2506, 'lng': 27.6639, 'district': 'Milas'},
        {'name': 'Dalaman Havalimanı', 'lat': 36.7131, 'lng': 28.7925, 'district': 'Dalaman'},
        {'name': 'Ortaca Merkez', 'lat': 36.8389, 'lng': 28.7644, 'district': 'Ortaca'},
        {'name': 'Köyceğiz Merkez', 'lat': 36.9689, 'lng': 28.6844, 'district': 'Köyceğiz'},
        {'name': 'Ula Merkez', 'lat': 37.1123, 'lng': 28.4112, 'district': 'Ula'},
    ],
    
    'Adana': [
        {'name': 'Seyhan Optimum AVM', 'lat': 37.0000, 'lng': 35.3213, 'district': 'Seyhan'},
        {'name': 'Çukurova M1 AVM', 'lat': 36.9834, 'lng': 35.3567, 'district': 'Çukurova'},
        {'name': 'Yüreğir Merkez', 'lat': 36.9456, 'lng': 35.3989, 'district': 'Yüreğir'},
        {'name': 'Sarıçam OSB', 'lat': 37.0823, 'lng': 35.3645, 'district': 'Sarıçam'},
        {'name': 'Ceyhan Merkez', 'lat': 37.0289, 'lng': 35.8156, 'district': 'Ceyhan'},
        {'name': 'Kozan Merkez', 'lat': 37.4456, 'lng': 35.8178, 'district': 'Kozan'},
        {'name': 'İmamoğlu Merkez', 'lat': 37.2645, 'lng': 35.6734, 'district': 'İmamoğlu'},
    ],
    
    'Mersin': [
        {'name': 'Akdeniz Forum Mersin', 'lat': 36.8121, 'lng': 34.6415, 'district': 'Akdeniz'},
        {'name': 'Mezitli Marina', 'lat': 36.7623, 'lng': 34.5789, 'district': 'Mezitli'},
        {'name': 'Toroslar Merkez', 'lat': 36.8234, 'lng': 34.6789, 'district': 'Toroslar'},
        {'name': 'Yenişehir Cumhuriyet Meydanı', 'lat': 36.7945, 'lng': 34.6234, 'district': 'Yenişehir'},
        {'name': 'Tarsus Merkez', 'lat': 36.9178, 'lng': 34.8967, 'district': 'Tarsus'},
        {'name': 'Erdemli Sahil', 'lat': 36.6045, 'lng': 34.3067, 'district': 'Erdemli'},
        {'name': 'Silifke Merkez', 'lat': 36.3789, 'lng': 33.9345, 'district': 'Silifke'},
    ],
    
    'Konya': [
        {'name': 'Selçuklu Kulesite', 'lat': 37.8756, 'lng': 32.4945, 'district': 'Selçuklu'},
        {'name': 'Meram Meram Park', 'lat': 37.8534, 'lng': 32.4678, 'district': 'Meram'},
        {'name': 'Karatay Alaeddin Tepesi', 'lat': 37.8712, 'lng': 32.4823, 'district': 'Karatay'},
        {'name': 'Ereğli Merkez', 'lat': 37.5123, 'lng': 34.0467, 'district': 'Ereğli'},
        {'name': 'Akşehir Merkez', 'lat': 38.3578, 'lng': 31.4156, 'district': 'Akşehir'},
        {'name': 'Beyşehir Gölü', 'lat': 37.6789, 'lng': 31.7234, 'district': 'Beyşehir'},
    ],
    
    'Aydın': [
        {'name': 'Efeler Merkez', 'lat': 37.8456, 'lng': 27.8423, 'district': 'Efeler'},
        {'name': 'Kuşadası Marina', 'lat': 37.8585, 'lng': 27.2617, 'district': 'Kuşadası'},
        {'name': 'Nazilli Merkez', 'lat': 37.9134, 'lng': 28.3245, 'district': 'Nazilli'},
        {'name': 'Didim Altınkum', 'lat': 37.3723, 'lng': 27.2678, 'district': 'Didim'},
        {'name': 'Söke Merkez', 'lat': 37.7512, 'lng': 27.4089, 'district': 'Söke'},
        {'name': 'Germencik Merkez', 'lat': 37.8712, 'lng': 27.6034, 'district': 'Germencik'},
    ],
    
    'Balıkesir': [
        {'name': 'Altıeylül Merkez', 'lat': 39.6489, 'lng': 27.8856, 'district': 'Altıeylül'},
        {'name': 'Karesi 10 Temmuz', 'lat': 39.6534, 'lng': 27.8923, 'district': 'Karesi'},
        {'name': 'Edremit Akçay', 'lat': 39.5934, 'lng': 27.0234, 'district': 'Edremit'},
        {'name': 'Ayvalık Merkez', 'lat': 39.3189, 'lng': 26.6934, 'district': 'Ayvalık'},
        {'name': 'Bandırma Liman', 'lat': 40.3523, 'lng': 27.9778, 'district': 'Bandırma'},
        {'name': 'Gönen Kaplıcaları', 'lat': 40.1067, 'lng': 27.6478, 'district': 'Gönen'},
    ],
    
    'Eskişehir': [
        {'name': 'Odunpazarı Espark', 'lat': 39.7767, 'lng': 30.5256, 'district': 'Odunpazarı'},
        {'name': 'Tepebaşı Porsuk', 'lat': 39.7645, 'lng': 30.5434, 'district': 'Tepebaşı'},
        {'name': 'Sivrihisar Merkez', 'lat': 39.4489, 'lng': 31.5378, 'district': 'Sivrihisar'},
        {'name': 'Çifteler Merkez', 'lat': 39.3856, 'lng': 31.0445, 'district': 'Çifteler'},
        {'name': 'Mahmudiye Merkez', 'lat': 39.4923, 'lng': 31.2334, 'district': 'Mahmudiye'},
    ],
    
    'Denizli': [
        {'name': 'Pamukkale Forum AVM', 'lat': 37.7742, 'lng': 29.0847, 'district': 'Pamukkale'},
        {'name': 'Merkezefendi Merkez', 'lat': 37.7623, 'lng': 29.1023, 'district': 'Merkezefendi'},
        {'name': 'Çivril Merkez', 'lat': 38.2989, 'lng': 29.7367, 'district': 'Çivril'},
        {'name': 'Acıpayam Merkez', 'lat': 37.4278, 'lng': 29.3456, 'district': 'Acıpayam'},
        {'name': 'Tavas Merkez', 'lat': 37.5745, 'lng': 29.0678, 'district': 'Tavas'},
    ],
    
    'Gaziantep': [
        {'name': 'Şahinbey Sanko Park', 'lat': 37.0662, 'lng': 37.3833, 'district': 'Şahinbey'},
        {'name': 'Şehitkamil Forum', 'lat': 37.0456, 'lng': 37.3545, 'district': 'Şehitkamil'},
        {'name': 'Nizip Merkez', 'lat': 37.0089, 'lng': 37.7956, 'district': 'Nizip'},
        {'name': 'İslahiye Merkez', 'lat': 37.0278, 'lng': 36.6323, 'district': 'İslahiye'},
        {'name': 'Nurdağı Merkez', 'lat': 37.1756, 'lng': 37.1645, 'district': 'Nurdağı'},
    ],
    
    'Kayseri': [
        {'name': 'Kocasinan Forum', 'lat': 38.7312, 'lng': 35.4856, 'district': 'Kocasinan'},
        {'name': 'Melikgazi Park AVM', 'lat': 38.7234, 'lng': 35.4678, 'district': 'Melikgazi'},
        {'name': 'Talas Merkez', 'lat': 38.6823, 'lng': 35.5545, 'district': 'Talas'},
        {'name': 'Develi Merkez', 'lat': 38.3889, 'lng': 35.4912, 'district': 'Develi'},
    ],
    
    'Tekirdağ': [
        {'name': 'Süleymanpaşa Merkez', 'lat': 40.9778, 'lng': 27.5123, 'district': 'Süleymanpaşa'},
        {'name': 'Çorlu Merkez', 'lat': 41.1595, 'lng': 27.8006, 'district': 'Çorlu'},
        {'name': 'Çerkezköy OSB', 'lat': 41.2889, 'lng': 28.0134, 'district': 'Çerkezköy'},
        {'name': 'Malkara Merkez', 'lat': 40.8889, 'lng': 26.9012, 'district': 'Malkara'},
        {'name': 'Muratlı Merkez', 'lat': 41.1756, 'lng': 27.4989, 'district': 'Muratlı'},
    ],
    
    'Manisa': [
        {'name': 'Yunusemre Merkez', 'lat': 38.6191, 'lng': 27.4289, 'district': 'Yunusemre'},
        {'name': 'Şehzadeler Forum', 'lat': 38.6078, 'lng': 27.4567, 'district': 'Şehzadeler'},
        {'name': 'Turgutlu Merkez', 'lat': 38.5023, 'lng': 27.7023, 'district': 'Turgutlu'},
        {'name': 'Akhisar Merkez', 'lat': 38.9189, 'lng': 27.8378, 'district': 'Akhisar'},
        {'name': 'Salihli Merkez', 'lat': 38.4823, 'lng': 28.1389, 'district': 'Salihli'},
    ],
    
    'Sakarya': [
        {'name': 'Adapazarı Kent Meydanı', 'lat': 40.7569, 'lng': 30.4058, 'district': 'Adapazarı'},
        {'name': 'Serdivan Merkez', 'lat': 40.7812, 'lng': 30.3645, 'district': 'Serdivan'},
        {'name': 'Akyazı Merkez', 'lat': 40.6856, 'lng': 30.6245, 'district': 'Akyazı'},
        {'name': 'Geyve Merkez', 'lat': 40.5078, 'lng': 30.2934, 'district': 'Geyve'},
        {'name': 'Hendek Merkez', 'lat': 40.7978, 'lng': 30.7489, 'district': 'Hendek'},
    ],
    
    'Çanakkale': [
        {'name': 'Merkez Kordon', 'lat': 40.1553, 'lng': 26.4142, 'district': 'Merkez'},
        {'name': 'Biga Merkez', 'lat': 40.2289, 'lng': 27.2456, 'district': 'Biga'},
        {'name': 'Gelibolu Liman', 'lat': 40.4078, 'lng': 26.6712, 'district': 'Gelibolu'},
        {'name': 'Çan Merkez', 'lat': 40.0356, 'lng': 27.0534, 'district': 'Çan'},
        {'name': 'Ayvacık Merkez', 'lat': 39.6012, 'lng': 26.4045, 'district': 'Ayvacık'},
    ],
}

def generate_distributed_stations():
    stations = []
    station_id = 1
    
    for city, target_count in EV_DISTRIBUTION_2025.items():
        print(f"🏙️ {city}: {target_count} istasyon oluşturuluyor...")
        
        if city in DETAILED_LOCATIONS:
            base_locations = DETAILED_LOCATIONS[city]
            
            # Her lokasyonu kullan ve çoğalt
            stations_per_location = max(1, target_count // len(base_locations))
            
            for base_loc in base_locations:
                # Her lokasyona birden fazla istasyon ekle
                for i in range(stations_per_location):
                    # Küçük offset ekleyerek aynı bölgede farklı noktalar oluştur
                    lat_offset = random.uniform(-0.005, 0.005)
                    lng_offset = random.uniform(-0.005, 0.005)
                    
                    lat = round(base_loc['lat'] + lat_offset, 6)
                    lng = round(base_loc['lng'] + lng_offset, 6)
                    
                    # Güç tipini belirle
                    power_type = random.choices(
                        ['HPC', 'DC', 'AC'],
                        weights=[0.3, 0.5, 0.2]
                    )[0]
                    
                    if power_type == 'HPC':
                        power = '180 kW'
                        dc_sockets = 6
                        ac_sockets = 8
                    elif power_type == 'DC':
                        power = '150 kW'
                        dc_sockets = 4
                        ac_sockets = 6
                    else:
                        power = '50 kW'
                        dc_sockets = 2
                        ac_sockets = 4
                    
                    # İstasyon tipi
                    station_type = random.choice(['mall', 'city', 'highway'])
                    
                    # Lokasyon adı - eğer birden fazla istasyon varsa numara ekle
                    location_name = base_loc['name']
                    if i > 0:
                        location_name += f" {i+1}. İstasyon"
                    
                    # Format: "İstanbul - Bağcılar - Bağcılar Meydan AVM"
                    district = base_loc.get('district', '')
                    
                    station = {
                        'id': f'ZES{station_id:04d}',
                        'name': f"{city} - {district} - {location_name}" if district else f"{city} - {location_name}",
                        'address': f"{location_name}, {district}, {city}" if district else f"{location_name}, {city}",
                        'coordinates': {'lat': lat, 'lng': lng},
                        'dcSockets': dc_sockets,
                        'acSockets': ac_sockets,
                        'power': power,
                        'status': 'active',
                        'type': station_type
                    }
                    
                    stations.append(station)
                    station_id += 1
                    
                    if len([s for s in stations if city in s['name']]) >= target_count:
                        break
                
                if len([s for s in stations if city in s['name']]) >= target_count:
                    break
        else:
            # Diğer şehirler için genel üretim
            for i in range(target_count):
                lat = 39.0 + random.uniform(-2, 4)
                lng = 32.0 + random.uniform(-5, 5)
                
                power_type = random.choice(['HPC', 'DC', 'AC'])
                power = '180 kW' if power_type == 'HPC' else '150 kW' if power_type == 'DC' else '50 kW'
                
                station = {
                    'id': f'ZES{station_id:04d}',
                    'name': f"{city} - {i+1}. Şarj İstasyonu",
                    'address': f"{city} Merkez",
                    'coordinates': {'lat': round(lat, 6), 'lng': round(lng, 6)},
                    'dcSockets': 4,
                    'acSockets': 6,
                    'power': power,
                    'status': 'active',
                    'type': 'city'
                }
                
                stations.append(station)
                station_id += 1
    
    return stations

# Oluştur
print("⚡ İstasyonlar gerçekçi şekilde dağıtılıyor...\n")
stations = generate_distributed_stations()

# Kaydet
with open('real_zes_stations.json', 'w', encoding='utf-8') as f:
    json.dump(stations, f, indent=2, ensure_ascii=False)

print(f"\n✅ Toplam {len(stations)} istasyon oluşturuldu ve kaydedildi!")

# İstatistikler
print("\n📊 ŞEHİR DAĞILIMI:")
city_counts = {}
for s in stations:
    city = s['name'].split(' - ')[0].split(' ')[0]
    city_counts[city] = city_counts.get(city, 0) + 1

for city, count in sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"  {city}: {count} istasyon")

# İstanbul örnekleri
print("\n🏙️ İSTANBUL ÖRNEKLERİ (İlk 15):")
istanbul_stations = [s for s in stations if 'İstanbul' in s['name']][:15]
for s in istanbul_stations:
    parts = s['name'].split(' - ')
    if len(parts) >= 2:
        location = parts[1]
        print(f"  ✓ {location}")
    else:
        print(f"  ✓ {s['name']}")
