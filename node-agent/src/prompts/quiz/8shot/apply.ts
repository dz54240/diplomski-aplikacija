import type { ShotExample } from './types.js';

export const APPLY_EXAMPLES: ShotExample[] = [
  {
    language: 'hr',
    context:
      'Tijekom treninga neuronske mreže promatra se krivulja gubitka po epohama. Različiti obrasci promjena u krivulji indiciraju različite vrste problema s modelom ili optimizacijom koje zahtijevaju različite mjere.',
    stem:
      'Ako trening loss više ne pada nakon 50 epoha i vrijednost je vrlo niska, koja je najvjerojatnija dijagnoza i sljedeća mjera?',
    correct:
      'Model je konvergirao na trening skupu; provjeriti validation loss radi otkrivanja moguće prenaučenosti modela.',
    distractors: [
      'Učenje je zaglavilo u lokalnom minimumu; smanjiti learning rate za faktor 10 i nastaviti trening od trenutne točke.',
      'Eksplozija gradijenata oslabila je optimizaciju; primijeniti gradient clipping s maksimalnom normom 1.0 po koraku.',
      'Premalo podataka uzrokuje stagnaciju; ponovno pokrenuti trening s istim podacima ali duže — barem 200 epoha.',
    ],
  },
  {
    language: 'hr',
    context:
      'Pri klasifikacijskim problemima gdje je odnos klasa neuravnotežen (npr. 95 % negativnih i 5 % pozitivnih primjera), standardne metrike mogu davati zavaravajuće rezultate o stvarnoj korisnosti naučenog klasifikatora.',
    stem:
      'Za skup podataka s 95 % negativnih i 5 % pozitivnih uzoraka, koja metrika najbolje procjenjuje koristan rad klasifikatora pozitivne klase?',
    correct: 'F1-score ili PR-AUC, koji kombiniraju preciznost i odziv specifično za klasu od interesa.',
    distractors: [
      'Točnost (accuracy), jer mjeri ukupan udio ispravnih predikcija u obje klase neovisno o njihovom omjeru.',
      'Mean squared error (MSE), jer kažnjava odstupanja od stvarne vrijednosti u oba smjera podjednako.',
      'ROC-AUC izračunat samo na negativnoj klasi, jer je ona dominantna i nosi najviše informacije o modelu.',
    ],
  },
  {
    language: 'hr',
    context:
      'Sporo izvođenje SELECT upita često je posljedica sekvencijalnog pregledavanja velikih tablica. Sustav baze može koristiti indeks ako postoji odgovarajuća struktura, što značajno ubrzava traženje i sortiranje.',
    stem:
      'Ako upit "SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10" traje predugo, gdje dodati indeks?',
    correct:
      'Kompozitni indeks na (customer_id, created_at DESC) koji pokriva i WHERE filter i ORDER BY sortiranje upita.',
    distractors: [
      'Pojedinačni indeks na stupcu "customer_id" i zaseban pojedinačni indeks na svakom od preostalih stupaca tablice.',
      'GIN indeks na cijeloj tablici "orders" da se ubrza svako pretraživanje neovisno o stupcu koji se koristi u WHERE.',
      'Indeks na stupcu "id" (primarni ključ tablice) jer ubrzava LIMIT klauzulu pri vraćanju manjeg broja redaka.',
    ],
  },
  {
    language: 'hr',
    context:
      'Treniranje duboke neuronske mreže pati od problema gdje gradijenti postaju izrazito mali tijekom backpropagation-a kroz mnogo slojeva, otežavajući ažuriranje težina u ranim slojevima blizu ulaza.',
    stem:
      'Mreža s 30 sigmoid aktivacijskih slojeva ne uči — gubitak ostaje konstantan tijekom prvih 20 epoha. Koja je najprikladnija izmjena arhitekture?',
    correct:
      'Zamijeniti sigmoid aktivacije s ReLU varijantama i dodati residual (skip) konekcije između distalnih slojeva.',
    distractors: [
      'Povećati learning rate na 10.0 da gradijenti brže napreduju kroz duboke slojeve mreže i postignu vidljivu promjenu.',
      'Ukloniti svu regularizaciju jer L2 prečesto kažnjava male težine u ranim slojevima i sprječava efektivno učenje.',
      'Zamrznuti prvih 15 slojeva i trenirati samo posljednjih 15 dok se ukupni gubitak ne smanji ispod ciljnog praga.',
    ],
  },
  {
    language: 'en',
    context:
      'A trained model shows 99% training accuracy but only 65% validation accuracy on a clean labelled dataset of comparable size to the training set. This kind of gap indicates a specific learning problem.',
    stem:
      'A model has 99% training accuracy but only 65% validation accuracy on clean comparable data. Which technique most directly reduces this gap?',
    correct:
      'Add L2 regularization or dropout to the network and apply early stopping based on the validation loss curve.',
    distractors: [
      'Switch to a deeper architecture with significantly more parameters to better capture the training-set patterns observed so far.',
      'Train for many more epochs until the validation accuracy eventually catches up to and matches the training accuracy.',
      'Disable data shuffling between epochs so that the model sees the same examples in a fixed deterministic order each pass.',
    ],
  },
  {
    language: 'en',
    context:
      'A common interview problem is detecting whether an unsorted array contains any duplicate values, with focus on the time-space tradeoffs and the choice of supporting data structure used during the scan.',
    stem: 'Which approach detects duplicates in an unsorted array of n elements in expected O(n) time and O(n) space?',
    correct:
      'Insert each element into a hash set during a single linear scan and return true on the first collision encountered.',
    distractors: [
      'Sort the input array in place and then scan once for adjacent equal elements, completing the task in linear total time.',
      'Compare every pair of indices (i, j) with i < j, returning true on the first equal pair found during the nested traversal.',
      'Build a binary search tree from the elements and check for hash collisions during insertion in linear total expected time.',
    ],
  },
  {
    language: 'en',
    context:
      'When multiple users update the same rows simultaneously, the database isolation level controls which anomalies are possible. Stricter levels prevent more anomalies but reduce concurrency for other transactions.',
    stem:
      'Two users update the same bank-account row concurrently, and the application requires that no update is silently lost. Which isolation level is required?',
    correct: 'Serializable, which makes concurrent transactions behave as if they had been executed in some serial order.',
    distractors: [
      'Read Committed, which only prevents any transaction from reading data that another transaction has written but not yet committed.',
      'Repeatable Read, which only guarantees that the same row returned by repeated reads inside a transaction has the same value.',
      'Read Uncommitted, which allows the highest possible concurrency by relaxing all of the anomaly-prevention guarantees of the engine.',
    ],
  },
  {
    language: 'en',
    context:
      'A recursive function that processes deeply nested data crashes on inputs longer than a few thousand elements with a stack-overflow error, even though the logic of the function is correct for small valid inputs.',
    stem:
      'A correct recursive function crashes with a stack-overflow error on inputs of size 10 000. What is the most appropriate fix?',
    correct:
      'Rewrite the function iteratively using an explicit stack data structure on the heap to avoid deep call chains.',
    distractors: [
      'Increase the system memory available to the process by an order of magnitude so each stack frame has more room to grow.',
      'Insert a short sleep call inside the recursive function to slow execution and reduce pressure on the runtime stack.',
      'Wrap each recursive call in a try-catch block that retries the call once on a stack-overflow exception when it occurs.',
    ],
  },
];
