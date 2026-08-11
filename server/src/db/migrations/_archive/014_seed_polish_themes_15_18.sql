-- Seed Polish vocabulary for themes 15-18 (pl_352 through pl_491)
-- Theme 15: Cyfrowy nomadyzm (pl_352–pl_382)
-- Theme 16: Konstrukcje z przypadkami (pl_383–pl_395)
-- Theme 17: Media społecznościowe (pl_396–pl_435)
-- Theme 18: My i media (pl_436–pl_491)

BEGIN;

-- Expand target and ipa columns to TEXT to accommodate full sentences
ALTER TABLE vocab ALTER COLUMN target TYPE TEXT;
ALTER TABLE vocab ALTER COLUMN ipa TYPE TEXT;

-- ============================================================
-- 1. Insert vocab entries
-- ============================================================

-- ── Theme 15: Cyfrowy nomadyzm ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_352', 'Jeszcze kilka lat temu, kiedy mówiłem znajomym, że jestem cyfrowym nomadą, patrzyli się na mnie, jakbym zwariował.', '/ˈjɛʂtʂɛ ˈkilka lat ˈtɛmu .../', NULL, 400, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_353', 'To określenie jest bardziej znane, ponieważ styl pracy i życia zwany cyfrowym nomadyzmem staje się coraz popularniejszy.', '/tɔ ɔkrɛɕˈlɛɲɛ .../', NULL, 401, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_354', 'Na czym to wszystko polega?', '/na tʂɨm tɔ ˈfʂɨstkɔ pɔˈlɛga/', NULL, 402, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_355', 'Cyfrowym nomadom do pracy potrzebny jest tylko komputer i internet.', '/t͡sɨˈfrɔvɨm nɔˈmadɔm dɔ ˈprat͡sɨ .../', NULL, 403, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_356', 'Łączą taką formę zarobkowania z podróżowaniem.', '/ˈwɔ̃nt͡ʂɔ̃ ˈtakɔ̃ ˈfɔrmɛ zarɔbkɔˈvaɲa s pɔdrɔʐɔˈvaɲɛm/', NULL, 404, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_357', 'Zwykle zatrzymują się na jakiś czas w ciekawym miejscu i po pracy korzystają z jego atutów.', '/ˈzvɨklɛ zatr̥ɨˈmujɔ̃ ɕɛ .../', NULL, 405, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_358', 'Czasami postanawiają zostać gdzieś na dłużej.', '/t͡ʂaˈɕamʲi pɔstaˈnavʲɔ̃ ˈzɔstat͡ɕ gd͡ʑɛɕ na ˈdwuʐɛj/', NULL, 406, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_359', 'Nawiązują nowe znajomości, poznają kulturę kraju, w którym przebywają, i uczą się języka.', '/navʲɔ̃ˈzujɔ̃ ˈnɔvɛ znaˈjɔmɔɕt͡ɕi .../', NULL, 407, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_360', 'Wiele osób myśli, że cyfrowym nomadą może zostać tylko singiel. To nieprawda.', '/ˈvʲɛlɛ ˈusɔp mɨɕli .../', NULL, 408, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_361', 'Znam ludzi, którzy wyjeżdżają całymi rodzinami i organizują sobie życie w nowym miejscu.', '/znam ˈlʲud͡ʑi .../', NULL, 409, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_362', 'Dzieci uczęszczają do szkół lub uczą się w trybie edukacji domowej, a rodzice pracują.', '/ˈd͡ʑɛt͡ɕi ut͡ʂɛʂt͡ʂajɔ̃ dɔ ʂkuf .../', NULL, 410, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_363', 'Sam od pięciu lat jestem cyfrowym nomadą i nie żałuję, że się na to zdecydowałem.', '/sam ɔt ˈpʲɛɲt͡ʂu lat ˈjɛstɛm .../', NULL, 411, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_364', 'Moim zdaniem to wspaniałe doświadczenie.', '/ˈmɔim ˈzdaɲɛm tɔ fspʲaˈwawɛ dɔɕfʲat͡ʂɛɲt͡ɕɛ/', NULL, 412, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_365', 'Osobiście lubię zatrzymać się na dłużej w jakimś miejscu, żeby dobrze je poznać.', '/ɔsɔˈbʲiɕt͡ɕɛ ˈlubʲɛ .../', NULL, 413, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_366', 'Spędziłem rok w Tajlandii i rok na Bali, a teraz mieszkam w Hiszpanii, na Fuerteventurze.', '/ˈspɛnd͡ʑiwɛm rɔk .../', NULL, 414, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_367', 'Ale myślę już o kolejnym kraju. Może wybiorę Meksyk? Jeszcze nie wiem.', '/alɛ ˈmɨɕlɛ juʂ ɔ ˈkɔlɛjnɨm ˈkraj u .../', NULL, 415, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_368', 'Prowadzę swój sklep internetowy i zarabiam naprawdę dobrze.', '/prɔˈvad͡zɛ sfuj ˈsklɛp intɛrnɛˈtɔvɨ i zaˈrabʲam napˈradɛ ˈdɔbʐɛ/', NULL, 416, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_369', 'Dzięki temu nie muszę się martwić o koszty życia i podróżowania.', '/ˈd͡ʑɛ̃ŋkʲi ˈtɛmu ɲɛ ˈmuʂɛ ɕɛ ˈmart͡ɕit͡ɕ .../', NULL, 417, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_370', 'Jedynym minusem według mnie jest to, że rzadko widuję się z rodziną i przyjaciółmi z Katowic, skąd pochodzę.', '/jɛˈdɨnɨm ˈmin uːsɛm .../', NULL, 418, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_371', 'Nasze kontakty się rozluźniają i nie jest łatwo podtrzymywać je na odległość.', '/ˈnaʂɛ kɔnˈtaktɨ ɕɛ rɔzˈluɕɲajɔ̃ .../', NULL, 419, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_372', 'Znajomi pytają mnie, czy nie brak mi stabilizacji i czy nie chciałbym się ustatkować.', '/znaˈjɔmʲi pɨˈtajɔ̃ mɲɛ .../', NULL, 420, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_373', 'Mówią, że najwyższy czas założyć rodzinę i kupić mieszkanie, jednak ja na razie o tym nie myślę.', '/ˈmuvʲɔ̃ ʐɛ .../', NULL, 421, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_374', 'Korzystam z życia i dobrze się bawię.', '/kɔˈʐɨstam z ˈʐɨt͡ɕa i ˈdɔbʐɛ ɕɛ ˈbavʲɛ/', NULL, 422, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_375', 'cyfrowy nomada', '/t͡sɨˈfrɔvɨ nɔˈmada/', 'm', 376, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_376', 'pracować zdalnie', '/praˈt͡sɔvat͡ɕ ˈzd alɲɛ/', NULL, 377, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_377', 'zarabiać na życie', '/zaˈrabʲat͡ɕ na ˈʐɨt͡ɕɛ/', NULL, 378, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_378', 'koszty życia', '/ˈkɔʂtɨ ˈʐɨt͡ɕa/', NULL, 379, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_379', 'ustatkować się', '/ust atˈkɔvat͡ɕ ɕɛ/', NULL, 380, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_380', 'edukacja domowa', '/ɛduˈkat͡sja dɔˈmɔva/', 'f', 381, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_381', 'singiel', '/ˈɕiŋɡʲɛl/', 'm', 382, 'digital_nomad') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_382', 'korzystać z życia', '/kɔˈʐɨstat͡ɕ z ˈʐɨt͡ɕa/', NULL, 383, 'digital_nomad') ON CONFLICT DO NOTHING;

-- ── Theme 16: Konstrukcje z przypadkami ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_383', 'coś jest komuś potrzebne do czegoś', '/t͡ʂɔɕ ˈjɛst ˈkɔmuɕ pɔˈtʂɛbnɛ dɔ ˈt͡ʂɛɡɔɕ/', NULL, 423, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_384', 'łączyć coś z czymś', '/ˈwɔ̃nt͡ʂɨt͡ɕ ˈt͡ʂɔɕ s ˈt͡ʂɨmɕ/', NULL, 424, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_385', 'łączyć pracę z życiem rodzinnym', '/ˈwɔ̃nt͡ʂɨt͡ɕ ˈprat͡sɛ z ˈʐɨt͡ɕɛm rɔˈd͡ʑinnɨm/', NULL, 425, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_386', 'zatrzymać się w ciekawym miejscu / w jakimś mieście', '/zatʂɨˈmat͡ɕ ɕɛ f t͡ɕɛˈkavɨm ˈmʲɛjst͡su .../', NULL, 426, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_387', 'korzystać z atutów / z udogodnień / z basenu', '/kɔˈʐɨstat͡ɕ z aˈtutuf / z udɔˈɡɔdɲɛɲ / z baˈsɛnu/', NULL, 427, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_388', 'nawiązywać kontakty, znajomości, przyjaźnie', '/navʲɔ̃ˈzɨvat͡ɕ kɔnˈtaktɨ, znaˈjɔmɔɕt͡ɕi, pʂɨˈjaɕɲɛ/', NULL, 428, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_389', 'zostać cyfrowym nomadą, podróżnikiem', '/ˈzɔstat͡ɕ t͡sɨˈfrɔvɨm nɔˈmada, pɔˈdrɔʐɲikʲɛm/', NULL, 429, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_390', 'uczęszczać do szkoły', '/ut͡ʂɛʂt͡ʂat͡ɕ dɔ ˈʂkɔwɨ/', NULL, 430, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_391', 'wybierać kraj, zawód, studia', '/vɨˈbʲɛrat͡ɕ ˈkraj, ˈzavut, ˈstudʲa/', NULL, 431, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_392', 'zachowywać optymizm', '/zaˈxɔvɨvat͡ɕ ɔptɨˈmizm/', NULL, 432, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_393', 'prowadzić sklep internetowy, firmę, działalność gospodarczą', '/prɔˈvad͡ʑit͡ɕ ˈsklɛp .../', NULL, 433, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_394', 'martwić się o pieniądze, o pracę, o dzieci, o bezpieczeństwo', '/ˈmart͡ɕit͡ɕ ɕɛ ɔ pʲɔˈɲɔnd͡zɛ .../', NULL, 434, 'constructions') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_395', 'widywać się z rodziną, z przyjaciółmi, ze znajomymi', '/vʲiˈdɨvat͡ɕ ɕɛ z rɔˈd͡ʑinɔ̃ .../', NULL, 435, 'constructions') ON CONFLICT DO NOTHING;

-- ── Theme 17: Media społecznościowe ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_396', 'Żyjemy w świecie, w którym jednym kliknięciem możemy dowiedzieć się, co robią nasi znajomi.', '/ˈʐɨjɛmɨ f ˈɕfʲɛt͡ɕɛ .../', NULL, 436, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_397', 'Gdzie zjadł kolację ich ulubiony muzyk lub jaką sukienkę kupiła koleżanka, której nie widzieliśmy od paru lat.', '/gd͡ʑɛ ˈzjat kwɔˈlat͡sʲɛ .../', NULL, 437, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_398', 'Media społecznościowe stworzyły rzeczywistość, w której na wyciągnięcie ręki mamy dostęp do niekończącego się przypływu informacji.', '/ˈmɛdja spɔwɛt͡ʂɲɔˈt͡ʂɔvɛ stfɔˈʐɨwɨ .../', NULL, 438, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_399', 'Nietrudno się zgodzić z twierdzeniem, że świat nigdy wcześniej nie był tak dobrze połączony.', '/ɲɛˈtrudnɔ ɕɛ zˈɡɔd͡ʑit͡ɕ .../', NULL, 439, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_400', 'Jednak im bardziej popularny stał się Instagram, Facebook czy Twitter, tym więcej osób zaczęło zastanawiać się, gdzie zmierza rzeczywistość.', '/ˈjɛdnak im ˈbard͡ʑɛj pɔpuˈlarnɨ .../', NULL, 440, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_401', 'Liczba użytkowników mediów społecznościowych szacowana jest na trzy miliardy osób, czyli około 40% populacji.', '/ˈlʲid͡ʑba uʐɨtkɔˈvɲikuf .../', NULL, 441, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_402', 'Przeciętnie spędzamy dwie godziny dziennie na Instagramie, Facebooku czy Twitterze.', '/pʂɛˈt͡ɕɛnt͡ɕɛ ˈspɛnd͡ʐamɨ .../', NULL, 442, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_403', 'Statystyki pokazują, iż każdego dnia na Instagramie pojawia się 80 milionów zdjęć.', '/staˈtɨstɨkʲi pɔˈkazujɔ̃ .../', NULL, 443, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_404', 'A w przeciągu sekundy przybywa ponad 8 tysięcy postów na Twitterze.', '/a f pʂɛˈt͡ɕɔŋgu sɛˈkundɨ .../', NULL, 444, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_405', 'Nic dziwnego, że media społecznościowe wpływają nie tylko na formowanie dzisiejszego świata czy kultury, ale mają również znaczenie dla naszego funkcjonowania i zdrowia psychicznego.', '/ɲit͡ɕ ˈd͡ʑivnɛɡɔ .../', NULL, 445, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_406', 'Nie jest tajemnicą fakt, iż media społecznościowe wywołują u niejednej osoby przypływ zazdrości.', '/ɲɛ ˈjɛst tajɛmˈɲit͡sɔ̃ fakt .../', NULL, 446, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_407', 'Widok zdjęć znajomych odpoczywających na rajskich plażach czy w luksusowych apartamentach dla wielu potrafi być trudny do zniesienia.', '/ˈvidɔk zd͡ʑɛt͡ɕ znaˈjɔmɨx .../', NULL, 447, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_408', 'Szczególnie że porównujemy naszą rzeczywistość z tym, co zobaczymy na portalu.', '/ʂt͡ʂɛˈɡulɲɛ ʐɛ pɔruˈwnujɛmɨ .../', NULL, 448, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_409', 'Badanie przeprowadzone w zeszłym roku pokazały, iż prawie połowa użytkowników mediów społecznościowych czuła smutek po obejrzeniu zdjęć z życia znajomych.', '/baˈdaɲɛ .../', NULL, 449, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_410', 'A dwadzieścia pięć procent osób było zazdrosnych, gdy znajomy polubił zdjęcie kogoś innego, zamiast zwrócić uwagę na ich posty.', '/a dvaˈd͡ʑɛɕt͡ɕɛ pʲɛɲt͡ɕ prɔˈt͡sɛnt .../', NULL, 450, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_411', 'To jedna strona medalu.', '/tɔ ˈjɛdna ˈstrɔna mɛˈdalu/', NULL, 451, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_412', 'Druga pokazuje, że większość użytkowników (66%) celowo tworzy wpisy w mediach społecznościowych w taki sposób, aby ukazywały ich życie ciekawiej niż wygląda ono w rzeczywistości.', '/ˈdruɡa pɔˈkazuje .../', NULL, 452, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_413', 'Ponad 52 procent badanych przyznało także, iż publikowane przez nich zdjęcia mają wywołać zazdrość wśród rodziny i znajomych.', '/ˈpɔnat ˈpʲɛɲt͡ʂɛt d͡ʑɛˈɕɔnt dˈvat .../', NULL, 453, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_414', 'W ten sposób podbudowują swoje poczucie wartości.', '/f tɛn ˈspɔsup pɔdbuˈdɔvujɔ̃ ˈsfɔjɛ pɔˈt͡ʂut͡ɕɛ ˈwartɔɕt͡ɕi/', NULL, 454, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_415', 'Większość z nas jest świadoma negatywnych skutków niewłaściwego korzystania z mediów społecznościowych.', '/ˈvʲɛŋkʂɔɕt͡ɕ z nas .../', NULL, 455, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_416', 'Jednak mimo wszystko nie możemy oprzeć się pokusie ich oglądania kilka razy dziennie.', '/ˈjɛdnak ˈmimɔ ˈfʂɨstkɔ .../', NULL, 456, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_417', 'Dlatego niektórzy badacze uznali, że publikowanie postów jest trudniejsze do opanowania, niż powstrzymanie się od palenia papierosów czy picia alkoholu.', '/dlaˈtɛɡɔ .../', NULL, 457, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_418', 'Mogłoby brzmieć to jak szaleństwo, dopóki nie zwrócimy uwagi na fakt, że w tym momencie miliony ludzi na całym świecie przesuwają palcem po ekranie telefonu, przeglądając Instagram.', '/mɔˈɡwɔbɨ .../', NULL, 458, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_419', 'A w kolejnej minucie YouTube zaleje fala trzystu godzin przeróżnych nagrań.', '/a f ˈkɔlɛjnɛj mʲiˈnutɛ .../', NULL, 459, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_420', 'jednym kliknięciem', '/ˈjɛdnɨm klʲikˈɲɛnt͡ɕɛm/', NULL, 460, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_421', 'na wyciągnięcie ręki', '/na vɨt͡ɕɔŋɡˈɲɛnt͡ɕɛ ˈrɛŋkʲi/', NULL, 461, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_422', 'przypływ informacji', '/ˈpʂɨpwɨf ˌiɱfɔrˈmat͡sji/', 'm', 462, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_423', 'liczba użytkowników', '/ˈlʲid͡ʑba uʐɨtkɔˈvɲikuf/', 'f', 463, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_424', 'publikować posty', '/publʲiˈkɔvat͡ɕ ˈpɔstɨ/', NULL, 464, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_425', 'polubić zdjęcie', '/pɔˈlubʲit͡ɕ ˈzd͡ʑɛt͡ɕɛ/', NULL, 465, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_426', 'subskrybować kanał', '/supsˈkrɨbɔvat͡ɕ ˈkanaw/', NULL, 466, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_427', 'prowadzić kanał', '/prɔˈvad͡ʑit͡ɕ ˈkanaw/', NULL, 467, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_428', 'wykupić abonament', '/vɨˈkupʲit͡ɕ abɔnaˈmɛnt/', NULL, 468, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_429', 'przypływ zazdrości', '/ˈpʂɨpwɨf zazˈdrɔɕt͡ɕi/', 'm', 469, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_430', 'trudny do zniesienia', '/ˈtrudnɨ dɔ znʲɛˈɕɛɲa/', NULL, 470, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_431', 'poczucie wartości', '/pɔˈt͡ʂut͡ɕɛ ˈvartɔɕt͡ɕi/', 'n', 471, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_432', 'oprzeć się pokusie', '/ˈɔpʂɛt͡ɕ ɕɛ pɔˈkusʲɛ/', NULL, 472, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_433', 'być trudniejszym do opanowania', '/bɨt͡ɕ trudˈɲɛjʂɨm dɔ ɔpanɔˈvaɲa/', NULL, 473, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_434', 'powstrzymać się od palenia', '/pɔfˈtʂɨmat͡ɕ ɕɛ ɔt paˈlɛɲa/', NULL, 474, 'social_media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_435', 'przesuwać palcem po ekranie', '/pʂɛˈsuvat͡ɕ ˈpalt͡sɛm pɔ ɛkˈraɲɛ/', NULL, 475, 'social_media') ON CONFLICT DO NOTHING;

-- ── Theme 18: My i media ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_436', 'Nie wyobrażam sobie śniadania bez czytania gazety.', '/ɲɛ vɨɔˈbraʐam ˈsɔbʲɛ ɕɲaˈdaɲa bɛs t͡ʂɨˈtaɲa ɡaˈzɛtɨ/', NULL, 476, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_437', 'To taki mój święty czas, przeznaczony wyłącznie dla mnie.', '/tɔ ˈtaki muf ˈɕfʲɛntɨ t͡ʂas .../', NULL, 477, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_438', 'Wstaję tak, abym nie musiał się spieszyć, robię sobie kanapki, parzę kawę i zasiadam przy stole.', '/ˈfstajɛ tak .../', NULL, 478, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_439', 'Przez jakieś 40 minut czytam sobie w spokoju wiadomości i nie ma mnie dla nikogo.', '/pʂɛz ˈjakʲɛɕ .../', NULL, 479, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_440', 'W domu wszyscy od dawna wiedzą, że można ze mną rozmawiać dopiero, gdy skończę czytać.', '/v dɔmu ˈfʂɨst͡sɨ ɔd ˈdavna .../', NULL, 480, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_441', 'Uwielbiam muzykę. Nie znoszę jednak radia, jeszcze żadna stacja mi się nie spodobała na tyle, żeby jej słuchać.', '/uˈvʲɛlbʲam muˈzɨkɛ .../', NULL, 481, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_442', 'W każdej za dużo gadają i w każdej puszczają za dużo reklam.', '/f ˈkaʐdɛj za ˈduʐɔ ɡaˈdajɔ̃ .../', NULL, 482, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_443', 'Dlatego kiedyś słuchałam tylko swoich płyt, ale odkąd odkryłam Spotify, już tego nie robię.', '/dlaˈtɛɡɔ ˈkʲɛdɨɕ .../', NULL, 483, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_444', 'Mam teraz dostęp do wszystkiego, co lubię.', '/mam ˈtɛraz ˈdɔstɛmp dɔ ˈfʂɨstkʲɛɡɔ t͡ʂɔ ˈlubʲɛ/', NULL, 484, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_445', 'Od zawsze czytałam książki wszędzie, gdzie się dało — w domu, szkole, poczekalni, autobusie.', '/ɔd ˈzafʂɛ ˈt͡ʂɨtawam ˈkɕɔ̃ʐkʲi .../', NULL, 485, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_446', 'Nawet przy jedzeniu, co zwykle doprowadzało moją mamę do szału.', '/ˈnavɛt pʂɨ jɛˈd͡zɛɲu .../', NULL, 486, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_447', 'W moim rodzinnym domu najważniejszy był telewizor.', '/v ˈmɔim rɔˈd͡ʑinnɨm ˈdɔmu .../', NULL, 487, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_448', 'Właściwie nie pamiętam, aby rodzice go wyłączali, nawet zasypiali przy nim.', '/ˈwwaɕt͡ɕivʲɛ ɲɛ paˈmʲɛntam .../', NULL, 488, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_449', 'Był włączony w czasie posiłków, a także podczas wizyt gości i nikt nigdy nie powiedział, że mu przeszkadza.', '/bwɨ ˈfwɔ̃nt͡ʂɔnɨ .../', NULL, 489, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_450', 'Dopiero na studiach nauczyłem się żyć bez tego pudła i do tej pory obywam się bez niego.', '/dɔˈpʲɛrɔ na ˈstudʲax .../', NULL, 490, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_451', 'Internet, tylko Internet.', '/ˈintɛrnɛt ˈtɨlkɔ ˈintɛrnɛt/', NULL, 491, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_452', 'Zupełnie nie rozumiem po co ludziom jakaś telewizja czy radio.', '/zuˈpɛwɲɛ ɲɛ rɔˈzumʲɛm .../', NULL, 492, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_453', 'Zresztą, jak bardzo kochają te media, to znajdą je również w Internecie, co jasno pokazuje jego wyższość.', '/ˈzrɛʂtɔ̃ .../', NULL, 493, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_454', 'Dla mnie Internet jest całym światem, bo mogę z niego dowiedzieć się praktycznie wszystkiego.', '/dla mɲɛ ˈintɛrnɛt .../', NULL, 494, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_455', 'Nie muszę sprawdzać w słownikach, chodzić do biblioteki czy kupować gazet.', '/ɲɛ ˈmuʂɛ ˈspravd͡zat͡ɕ .../', NULL, 495, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_456', 'A i kontakty ze znajomymi mam na wyciągnięcie ręki.', '/a i kɔnˈtaktɛ z znaˈjɔmɨmʲi .../', NULL, 496, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_457', 'Bardzo lubię słuchać radia. Często coś gotuję (to moja kolejna pasja), więc radio znakomicie umila mi przy tym czas.', '/ˈbardzɔ ˈlubʲɛ .../', NULL, 497, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_458', 'Mam swoją ulubioną stację, choć muszę przyznać, że nie wszystkie audycje mi się podobają.', '/mam ˈsfɔjɔ̃ uluˈbʲɔnɔ̃ ˈstat͡sʲɛ .../', NULL, 498, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_459', 'Drażni mnie też to, że pojawia się coraz więcej reklam.', '/ˈdraʐɲi mɲɛ tɛʂ tɔ .../', NULL, 499, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_460', 'Ale lubię muzykę tam nadawaną, a poza tym mogę w ten sposób wysłuchać wielu ważnych informacji.', '/alɛ ˈlubʲɛ .../', NULL, 500, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_461', 'Jeśli tylko mam czas, oglądam filmy. Najchętniej seriale, mam kilka ulubionych.', '/ˈjɛɕlʲi ˈtɨlkɔ mam t͡ʂas .../', NULL, 501, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_462', 'Oczywiście nie w telewizji, bo nie pozwala ona oglądać tego, co lubię i wtedy, kiedy mogę.', '/ɔt͡ʂɨˈvʲiɕt͡ɕɛ .../', NULL, 502, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_463', 'Pracuję na zmiany, więc mój rozkład dnia jest co chwilę inny.', '/praˈt͡sujɛ na ˈzmʲanɨ .../', NULL, 503, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_464', 'Dlatego jestem gorącym zwolennikiem platform takich jak Netflix czy Showmax i wszystkich znajomych namawiam na wykupienie sobie abonamentu, na którejś z nich.', '/dlaˈtɛɡɔ ˈjɛstɛm .../', NULL, 504, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_465', 'Większość wiadomości czytam w Internecie, ale nie znaczy to, że nie kupuję gazet.', '/ˈvʲɛŋkʂɔɕt͡ɕ .../', NULL, 505, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_466', 'Kupuję, tylko nie są to dzienniki.', '/kuˈpujɛ ˈtɨlkɔ ɲɛ sɔ̃ tɔ d͡ʑɛɲˈɲikʲi/', NULL, 506, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_467', 'Wolę magazyny kobiece, w których znajdę interesujące mnie artykuły i wywiady.', '/ˈvɔlɛ maɡaˈzɨnɨ kɔˈbʲɛt͡sɛ .../', NULL, 507, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_468', 'Bardzo lubię też miesięcznik Charaktery, bo drukują tam naprawdę ważne i ciekawe teksty.', '/ˈbardzɔ ˈlubʲɛ tɛʂ mʲɛˈɕɛ̃nt͡ʂɲik .../', NULL, 508, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_469', 'Muszę się przyznać, że najwięcej czasu spędzam, przeglądając YouTube.', '/ˈmuʂɛ ɕɛ pʂɨˈznaʨ .../', NULL, 509, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_470', 'Nie tylko ze względu na teledyski czy filmiki. Tam naprawdę można znaleźć wszystko!', '/ɲɛ ˈtɨlkɔ zɛ zˈɡlɛndu .../', NULL, 510, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_471', 'Subskrybuję kilka kanałów i powoli przymierzam się do prowadzenia własnego.', '/supsˈkrɨbujɛ .../', NULL, 511, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_472', 'Ale na razie nie zdradzę, o czym on będzie.', '/alɛ na ˈraʑɛ ɲɛ ˈzdrad͡ʐɛ ɔ t͡ʂɛm ɔn ˈbɛnd͡ʑɛ/', NULL, 512, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_473', 'Chyba jestem urodzonym graczem.', '/ˈxɨba ˈjɛstɛm uˈrɔd͡ʐɔnɨm ˈɡrat͡ʂɛm/', NULL, 513, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_474', 'Na przejście ulubionej gry mogę poświęcić naprawdę dużo czasu, choć staram się przy tym nie zawalać spraw zawodowych.', '/na pʂɛjˈɕt͡ɕɛ .../', NULL, 514, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_475', 'Wiadomo, z czegoś żyć trzeba. Ale wolny czas spędzam najczęściej przy konsoli.', '/vʲaˈdɔmɔ z ˈt͡ʂɛɡɔɕ ʐɨt͡ɕ ˈtʂɛba .../', NULL, 515, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_476', 'Kiedyś robiłem to tylko na pececie, jednak wymaga to zbyt wielu nakładów finansowych.', '/ˈkʲɛdɨɕ ˈrɔbʲiwɛm .../', NULL, 516, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_477', 'Gry stają się coraz lepsze i coraz bardziej wymagające, a sprzęt szybko się starzeje i nie nadąża za tymi zmianami.', '/ˈɡrɨ ˈstajɔ̃ ɕɛ .../', NULL, 517, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_478', 'dziennik', '/ˈd͡ʑɛɲɲik/', 'm', 518, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_479', 'miesięcznik', '/mʲɛˈɕɛ̃nt͡ʂɲik/', 'm', 519, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_480', 'magazyn kobiecy', '/maɡaˈzɨn kɔˈbʲɛt͡sɨ/', 'm', 520, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_481', 'artykuł i wywiad', '/arˈtɨkuw i ˈvɨvʲat/', 'm', 521, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_482', 'stacja radiowa', '/ˈstat͡sʲa raˈdʲɔva/', 'f', 522, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_483', 'audycja', '/awˈdɨt͡sja/', 'f', 523, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_484', 'płyta', '/ˈpwɨta/', 'f', 524, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_485', 'serial', '/ˈsɛrjal/', 'm', 525, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_486', 'pracować na zmiany', '/praˈt͡sɔvat͡ɕ na ˈzmʲanɨ/', NULL, 526, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_487', 'rozkład dnia', '/ˈrɔskwat dɲa/', 'm', 527, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_488', 'urodzony gracz', '/urɔˈd͡ʐɔnɨ ˈɡrat͡ʂ/', 'm', 528, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_489', 'przejście gry', '/pʂɛjˈɕt͡ɕɛ ˈɡrɨ/', 'n', 529, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_490', 'konsola', '/kɔnˈsɔla/', 'f', 530, 'media') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_491', 'sprzęt', '/ˈspʂɛnt/', 'm', 531, 'media') ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Insert vocab translations (Russian)
-- ============================================================

INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_352', 'ru', 'Ещё несколько лет назад, когда я говорил знакомым, что я цифровой номад, они смотрели на меня, как будто я сошёл с ума.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_353', 'ru', 'Это определение более известно, потому что стиль работы и жизни, называемый цифровым номадизмом, становится всё более популярным.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_354', 'ru', 'В чём всё это заключается?') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_355', 'ru', 'Цифровым номадам для работы нужен только компьютер и интернет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_356', 'ru', 'Они совмещают такую форму заработка с путешествиями.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_357', 'ru', 'Обычно они останавливаются на какое-то время в интересном месте и после работы пользуются его преимуществами.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_358', 'ru', 'Иногда они решают остаться где-то надолго.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_359', 'ru', 'Они заводят новые знакомства, узнают культуру страны, в которой пребывают, и учат её язык.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_360', 'ru', 'Многие думают, что цифровым номадом может стать только одинокий человек. Это неправда.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_361', 'ru', 'Я знаю людей, которые уезжают целыми семьями и устраивают себе жизнь на новом месте.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_362', 'ru', 'Дети ходят в школы или учатся в режиме домашнего обучения, а родители работают.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_363', 'ru', 'Я сам уже пять лет как цифровой номад и не жалею, что решился на это.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_364', 'ru', 'По моему мнению, это замечательный опыт.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_365', 'ru', 'Лично я люблю задержаться надолго в каком-то месте, чтобы хорошо его узнать.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_366', 'ru', 'Я провёл год в Таиланде и год на Бали, а сейчас живу в Испании, на Фуэртевентуре.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_367', 'ru', 'Но я уже думаю о следующей стране. Может, выберу Мексику? Пока не знаю.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_368', 'ru', 'Я веду свой интернет-магазин и зарабатываю действительно хорошо.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_369', 'ru', 'Благодаря этому мне не нужно беспокоиться о стоимости жизни и путешествиях.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_370', 'ru', 'Единственный минус, по моему мнению, это то, что я редко вижусь с семьёй и друзьями из Катовице, откуда я родом.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_371', 'ru', 'Наши контакты ослабевают, и нелегко поддерживать их на расстоянии.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_372', 'ru', 'Знакомые спрашивают меня, не не хватает ли мне стабильности и не хотел бы я остепениться.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_373', 'ru', 'Они говорят, что самое время создать семью и купить квартиру, однако я пока об этом не думаю.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_374', 'ru', 'Я наслаждаюсь жизнью и хорошо провожу время.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_375', 'ru', 'цифровой номад') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_376', 'ru', 'работать удалённо') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_377', 'ru', 'зарабатывать на жизнь') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_378', 'ru', 'стоимость жизни') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_379', 'ru', 'остепениться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_380', 'ru', 'домашнее обучение') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_381', 'ru', 'одиночка, холостяк') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_382', 'ru', 'наслаждаться жизнью') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_383', 'ru', 'что-то кому-то нужно для чего-то (дат. + род.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_384', 'ru', 'соединять что-то с чем-то (вин. + твор.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_385', 'ru', 'соединять работу с семейной жизнью') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_386', 'ru', 'остановиться в интересном месте / в каком-то городе (местн.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_387', 'ru', 'пользоваться преимуществами / удобствами / бассейном (род.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_388', 'ru', 'заводить контакты, знакомства, дружеские отношения (вин.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_389', 'ru', 'стать цифровым номадом, путешественником (твор.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_390', 'ru', 'ходить в школу, посещать школу (род.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_391', 'ru', 'выбирать страну, профессию, учёбу (вин.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_392', 'ru', 'сохранять оптимизм (вин.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_393', 'ru', 'вести интернет-магазин, фирму, индивидуальное предпринимательство (вин.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_394', 'ru', 'беспокоиться о деньгах, о работе, о детях, о безопасности (вин.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_395', 'ru', 'видеться с семьёй, с друзьями, со знакомыми (твор.)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_396', 'ru', 'Мы живём в мире, в котором одним кликом можем узнать, что делают наши знакомые.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_397', 'ru', 'Где они ужинали, какой их любимый исполнитель или какое платье купила подруга, которую мы не видели несколько лет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_398', 'ru', 'Социальные сети создали реальность, в которой у нас на расстоянии вытянутой руки доступ к бесконечному потоку информации.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_399', 'ru', 'Нетрудно согласиться с утверждением, что мир никогда раньше не был так хорошо связан.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_400', 'ru', 'Однако чем популярнее становились Instagram, Facebook или Twitter, тем больше людей начало задумываться, куда движется реальность.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_401', 'ru', 'Количество пользователей социальных сетей оценивается в три миллиарда человек, то есть около 40% населения.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_402', 'ru', 'В среднем мы проводим два часа в день в Instagramie, Facebooku или Twitterze.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_403', 'ru', 'Статистика показывает, что каждый день в Instagramie появляется 80 миллионов фотографий.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_404', 'ru', 'А за секунду в Twittere прибавляется более 8 тысяч постов.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_405', 'ru', 'Неудивительно, что социальные сети влияют не только на формирование сегодняшнего мира или культуры, но также имеют значение для нашего функционирования и психического здоровья.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_406', 'ru', 'Не секрет, что социальные сети вызывают у некоторых людей прилив зависти.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_407', 'ru', 'Вид фотографий знакомых, отдыхающих на райских пляжах или в роскошных апартаментах, для многих может быть тяжело переносимым.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_408', 'ru', 'Особенно потому, что мы сравниваем нашу реальность с тем, что видим на портале.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_409', 'ru', 'Исследование, проведённое в прошлом году, показало, что почти половина пользователей социальных сетей чувствовала грусть после просмотра фотографий из жизни знакомых.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_410', 'ru', 'А двадцать пять процентов людей завидовали, когда знакомый лайкнул фото кого-то другого, вместо того чтобы обратить внимание на их посты.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_411', 'ru', 'Это одна сторона медали.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_412', 'ru', 'Другая показывает, что большинство пользователей (66%) намеренно создаёт записи в соцсетях так, чтобы они показывали их жизнь интереснее, чем она выглядит в реальности.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_413', 'ru', 'Более 52 процентов опрошенных признали также, что публикуемые ими фотографии должны вызвать зависть среди семьи и знакомых.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_414', 'ru', 'Таким образом они укрепляют своё чувство собственной значимости.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_415', 'ru', 'Большинство из нас осознаёт негативные последствия неправильного использования социальных сетей.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_416', 'ru', 'Однако несмотря на всё, мы не можем устоять перед искушением заглянуть в них несколько раз в день.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_417', 'ru', 'Поэтому некоторые исследователи признали, что публикация постов труднее поддаётся контролю, чем воздержание от курения сигарет или употребления алкоголя.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_418', 'ru', 'Это могло бы звучать как безумие, пока мы не обратим внимание на тот факт, что в эту минуту миллионы людей по всему миру водят пальцем по экрану телефона, просматривая Instagram.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_419', 'ru', 'А в следующую минуту YouTube захлестнёт волна из трёхсот часов самых разных записей.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_420', 'ru', 'в один клик') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_421', 'ru', 'на расстоянии вытянутой руки') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_422', 'ru', 'поток информации') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_423', 'ru', 'количество пользователей') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_424', 'ru', 'публиковать посты') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_425', 'ru', 'лайкнуть фото') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_426', 'ru', 'подписаться на канал') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_427', 'ru', 'вести канал') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_428', 'ru', 'купить подписку') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_429', 'ru', 'прилив зависти') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_430', 'ru', 'тяжело переносимый') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_431', 'ru', 'чувство собственной значимости') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_432', 'ru', 'устоять перед искушением') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_433', 'ru', 'труднее поддаваться контролю') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_434', 'ru', 'воздерживаться от курения') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_435', 'ru', 'водить пальцем по экрану') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_436', 'ru', 'Не представляю себе завтрак без чтения газеты.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_437', 'ru', 'Это моё «святое время», предназначенное исключительно для меня.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_438', 'ru', 'Встаю так, чтобы не пришлось спешить, делаю себе бутерброды, завариваю кофе и сажусь за стол.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_439', 'ru', 'Около 40 минут спокойно читаю новости, и меня ни для кого нет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_440', 'ru', 'Дома все давно знают, что со мной можно разговаривать только тогда, когда закончу читать.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_441', 'ru', 'Обожаю музыку. Однако не выношу радио, ни одна радиостанция мне не понравилась настолько, чтобы её слушать.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_442', 'ru', 'В каждой слишком много болтают и в каждой крутят слишком много рекламы.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_443', 'ru', 'Поэтому когда-то я слушала только свои пластинки, но с тех пор как открыла Spotify, уже этого не делаю.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_444', 'ru', 'Теперь у меня есть доступ ко всему, что я люблю.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_445', 'ru', 'Я всегда читала книги везде, где только можно — дома, в школе, в приёмной, в автобусе.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_446', 'ru', 'Даже во время еды, что обычно доводило мою маму до бешенства.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_447', 'ru', 'В моём родном доме самым важным был телевизор.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_448', 'ru', 'Собственно, не помню, чтобы родители его выключали, даже засыпали при нём.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_449', 'ru', 'Он был включён во время еды, а также во время визитов гостей, и никто никогда не сказал, что он мешает.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_450', 'ru', 'Только в университете я научился жить без этого ящика и до сих пор обхожусь без него.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_451', 'ru', 'Интернет, только Интернет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_452', 'ru', 'Совершенно не понимаю, зачем людям какое-то телевидение или радио.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_453', 'ru', 'Впрочем, как бы они ни любили эти медиа, они найдут их также в Интернете, что ясно показывает его превосходство.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_454', 'ru', 'Для меня Интернет — это весь мир, потому что из него я могу узнать практически всё.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_455', 'ru', 'Мне не нужно проверять в словарях, ходить в библиотеку или покупать газеты.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_456', 'ru', 'А контакты со знакомыми у меня на расстоянии вытянутой руки.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_457', 'ru', 'Очень люблю слушать радио. Часто что-то готовлю (это моё другое увлечение), поэтому радио прекрасно скрашивает мне время.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_458', 'ru', 'У меня есть любимая радиостанция, хотя должна признать, что не все передачи мне нравятся.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_459', 'ru', 'Меня раздражает также, что появляется всё больше рекламы.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_460', 'ru', 'Но мне нравится транслируемая там музыка, и кроме того, я могу таким образом услышать много важной информации.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_461', 'ru', 'Если только есть время, смотрю фильмы. Больше всего сериалы, у меня несколько любимых.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_462', 'ru', 'Конечно не по телевизору, потому что он не позволяет смотреть то, что я люблю, и тогда, когда я могу.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_463', 'ru', 'Я работаю по сменам, поэтому моё расписание дня каждую минуту другое.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_464', 'ru', 'Поэтому я горячий сторонник таких платформ, как Netflix или Showmax, и всех знакомых уговариваю купить себе подписку на какую-нибудь из них.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_465', 'ru', 'Большинство новостей читаю в Интернете, но это не значит, что не покупаю газет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_466', 'ru', 'Покупаю, только это не ежедневные издания.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_467', 'ru', 'Предпочитаю женские журналы, в которых найду интересующие меня статьи и интервью.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_468', 'ru', 'Очень люблю также ежемесячник «Charaktery», потому что там печатают по-настоящему важные и интересные тексты.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_469', 'ru', 'Должен признаться, что больше всего времени я провожу, просматривая YouTube.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_470', 'ru', 'Не только из-за клипов или видео — там действительно можно найти всё!') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_471', 'ru', 'Я подписан на несколько каналов и понемногу готовлюсь к ведению собственного.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_472', 'ru', 'Но пока не выдам, о чём он будет.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_473', 'ru', 'Кажется, я прирождённый игрок.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_474', 'ru', 'На прохождение любимой игры могу посвятить действительно много времени, хотя стараюсь при этом не запускать рабочие дела.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_475', 'ru', 'Известно, на что-то жить надо. Но свободное время чаще всего провожу за консолью.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_476', 'ru', 'Когда-то я делал это только на компьютере, однако это требует слишком больших финансовых затрат.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_477', 'ru', 'Игры становятся всё лучше и всё требовательнее, а оборудование быстро устаревает и не успевает за этими изменениями.') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_478', 'ru', 'ежедневная газета') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_479', 'ru', 'ежемесячный журнал') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_480', 'ru', 'женский журнал') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_481', 'ru', 'статья и интервью') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_482', 'ru', 'радиостанция') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_483', 'ru', 'передача (на радио)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_484', 'ru', 'пластинка') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_485', 'ru', 'сериал') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_486', 'ru', 'работать посменно') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_487', 'ru', 'расписание дня') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_488', 'ru', 'прирождённый игрок') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_489', 'ru', 'прохождение игры') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_490', 'ru', 'консоль') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_491', 'ru', 'оборудование, техника') ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Insert theme entries (orders 115-118)
-- ============================================================

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme15', 'Cyfrowy nomadyzm', 'Цифровой номадизм', 'Teksty i słownictwo o stylu życia cyfrowego nomadyzmu', 'Тексты и лексика о стиле жизни цифрового кочевника', 115, NULL, NULL) ON CONFLICT DO NOTHING;

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme16', 'Konstrukcje z przypadkami', 'Конструкции с падежами', 'Ważne konstrukcje gramatyczne z odpowiednimi przypadkami', 'Важные грамматические конструкции с соответствующими падежами', 116, NULL, NULL) ON CONFLICT DO NOTHING;

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme17', 'Media społecznościowe', 'Социальные сети', 'Teksty i słownictwo o mediach społecznościowych i ich wpływie', 'Тексты и лексика о социальных сетях и их влиянии', 117, NULL, NULL) ON CONFLICT DO NOTHING;

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme18', 'My i media', 'Мы и медиа', 'Osobiste relacje z mediami — gazety, radio, TV, Internet, gry', 'Личные отношения с медиа — газеты, радио, ТВ, интернет, игры', 118, NULL, NULL) ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. Insert theme_vocab mappings
-- ============================================================

-- Theme 15: Cyfrowy nomadyzm
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_352') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_353') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_354') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_355') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_356') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_357') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_358') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_359') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_360') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_361') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_362') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_363') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_364') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_365') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_366') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_367') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_368') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_369') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_370') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_371') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_372') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_373') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_374') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_375') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_376') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_377') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_378') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_379') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_380') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_381') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme15', 'pl_382') ON CONFLICT DO NOTHING;

-- Theme 16: Konstrukcje z przypadkami
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_383') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_384') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_385') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_386') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_387') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_388') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_389') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_390') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_391') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_392') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_393') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_394') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme16', 'pl_395') ON CONFLICT DO NOTHING;

-- Theme 17: Media społecznościowe
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_396') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_397') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_398') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_399') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_400') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_401') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_402') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_403') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_404') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_405') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_406') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_407') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_408') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_409') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_410') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_411') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_412') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_413') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_414') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_415') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_416') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_417') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_418') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_419') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_420') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_421') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_422') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_423') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_424') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_425') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_426') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_427') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_428') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_429') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_430') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_431') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_432') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_433') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_434') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme17', 'pl_435') ON CONFLICT DO NOTHING;

-- Theme 18: My i media
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_436') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_437') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_438') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_439') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_440') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_441') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_442') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_443') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_444') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_445') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_446') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_447') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_448') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_449') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_450') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_451') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_452') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_453') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_454') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_455') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_456') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_457') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_458') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_459') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_460') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_461') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_462') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_463') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_464') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_465') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_466') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_467') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_468') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_469') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_470') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_471') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_472') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_473') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_474') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_475') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_476') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_477') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_478') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_479') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_480') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_481') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_482') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_483') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_484') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_485') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_486') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_487') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_488') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_489') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_490') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme18', 'pl_491') ON CONFLICT DO NOTHING;

COMMIT;
