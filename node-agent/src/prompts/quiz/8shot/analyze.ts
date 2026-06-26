import type { ShotExample } from './types.js';

export const ANALYZE_EXAMPLES: ShotExample[] = [
  {
    language: 'hr',
    context:
      'Regularizacijske tehnike L1 i L2 dodaju kazneni član funkciji gubitka, ali utječu na težine modela na fundamentalno različite načine, što se odražava na strukturu konačnog rješenja modela nakon treninga.',
    stem: 'Koja je ključna razlika između L1 i L2 regularizacije s obzirom na utjecaj na težine treniranog modela?',
    correct:
      'L1 potiče rijetka rješenja gdje su mnoge težine točno nula, dok L2 ravnomjerno smanjuje sve težine bez postavljanja na nulu.',
    distractors: [
      'L1 normalizira težine na jediničnu Euklidsku duljinu, dok L2 normalizira težine na jediničnu varijancu po sloju.',
      'L1 se primjenjuje samo na bias članove neuronske mreže, dok L2 djeluje isključivo na pune težinske matrice.',
      'L1 se računa nad apsolutnim vrijednostima samo prvih 50 % težina po sloju, dok L2 sumira kvadrate svih težina.',
    ],
  },
  {
    language: 'hr',
    context:
      'Različite paradigme strojnog učenja razlikuju se prema načinu nadzora, odnosno koliko je oznaka dostupno na ulaznim podacima i kako model koristi strukturu označenih i neoznačenih primjera tijekom treniranja.',
    stem: 'Koja je suštinska razlika između supervised i semi-supervised learning paradigmi strojnog učenja?',
    correct:
      'Supervised koristi isključivo označene podatke; semi-supervised kombinira manju količinu označenih s velikom količinom neoznačenih primjera.',
    distractors: [
      'Supervised koristi numeričke značajke iz tabularnih podataka; semi-supervised koristi tekstualne i slikovne značajke iz multimedije.',
      'Supervised zahtijeva ravnotežu broja primjera po klasi; semi-supervised radi samo na izrazito neuravnoteženim skupovima podataka.',
      'Supervised se uvijek trenira u jednoj fazi do konvergencije; semi-supervised obavezno koristi dvije zasebne faze treniranja.',
    ],
  },
  {
    language: 'hr',
    context:
      'U dizajnu shema relacijskih baza ponekad se odlučuje za odstupanje od strogih normalnih oblika, ovisno o očekivanim obrascima čitanja i pisanja te trade-off-u između konzistentnosti podataka i performansi pri čitanju.',
    stem: 'Po čemu se normalizacija fundamentalno razlikuje od denormalizacije u dizajnu sheme relacijske baze?',
    correct:
      'Normalizacija eliminira redundanciju radi konzistentnosti pri pisanju, dok denormalizacija namjerno uvodi redundanciju radi brzine čitanja upita.',
    distractors: [
      'Normalizacija šifrira osjetljive stupce u tablicama radi privatnosti, dok denormalizacija ostavlja sve stupce u izvornom otvorenom obliku.',
      'Normalizacija povećava ukupan broj redaka u tablicama baze, dok denormalizacija smanjuje broj redaka kompresijom istovrijednih redaka.',
      'Normalizacija se primjenjuje isključivo na OLTP sustave za transakcijsku obradu, dok denormalizacija djeluje samo na in-memory cache slojeve.',
    ],
  },
  {
    language: 'hr',
    context:
      'Pretraživanje grafova ili stabala može se izvesti u dvije osnovne strategije — dubina prvo (DFS) i širina prvo (BFS) — koje pokazuju različita ponašanja i jamstva kada se primijene na isti ulazni graf.',
    stem: 'Po čemu se DFS i BFS bitno razlikuju kada se primjenjuju na isti neorijentirani povezan graf?',
    correct:
      'BFS uvijek pronalazi najkraći put po broju bridova od izvora do cilja; DFS može pronaći duži put i prvi dosegnuti udaljenije vrhove grafa.',
    distractors: [
      'BFS koristi rekurziju i sistemski stack memorije, dok DFS koristi iterativnu petlju s konstantnim memorijskim troškom neovisno o veličini grafa.',
      'BFS može pretraživati isključivo stabla bez ciklusa, dok je DFS jedini koji može obraditi grafove s ciklusima ili višestrukim komponentama.',
      'BFS je determinističan jer obrađuje susjedne vrhove abecednim redom, dok DFS bira potpuno slučajne susjede u svakom koraku obilaska.',
    ],
  },
  {
    language: 'en',
    context:
      'Dropout and L2 weight decay are both regularization techniques used in deep learning to reduce overfitting, but they act on the model in fundamentally different ways during training and inference.',
    stem: 'Why does dropout regularization differ fundamentally from L2 weight decay in how it constrains a neural network?',
    correct:
      'Dropout randomly silences activations during training to force redundancy across units, while L2 deterministically shrinks all weights toward zero at every gradient step.',
    distractors: [
      'Dropout is applied only at inference time to smooth final predictions, while L2 is applied only during training and disabled at inference.',
      'Dropout normalizes the magnitude of each activation to unit norm across the batch, while L2 normalizes per-layer outputs to unit variance.',
      'Dropout requires labelled validation data to function correctly during training, while L2 works only on top of unsupervised pretraining phases.',
    ],
  },
  {
    language: 'en',
    context:
      'Convolutional neural networks (CNNs) replaced multilayer perceptrons (MLPs) as the dominant architecture for image-recognition tasks, achieving substantially better results with fewer parameters than equivalent fully-connected baselines.',
    stem: 'Why do convolutional neural networks outperform multilayer perceptrons on natural image classification at comparable parameter budgets?',
    correct:
      'CNNs exploit spatial locality and translation invariance through weight sharing, drastically reducing parameters required for the same expressive power.',
    distractors: [
      'CNNs always have many more layers than MLPs, and the extra depth alone is sufficient to explain the entire observed accuracy gap on images.',
      'CNNs use rectified linear activations between layers, while MLPs are restricted by their definition to sigmoid or tanh activations only.',
      'CNNs are trained on grayscale single-channel images only, while MLPs are mathematically unable to process any kind of single-channel input.',
    ],
  },
  {
    language: 'en',
    context:
      'Relational SQL databases and NoSQL document or key-value stores represent two broad design philosophies for persistent storage, with different consistency, scalability, and query-expressiveness tradeoffs across the spectrum.',
    stem: 'What is the fundamental design difference between relational SQL databases and NoSQL document stores?',
    correct:
      'Relational systems enforce a fixed schema with cross-table joins over normalized data; document stores allow flexible per-document schemas without enforced joins.',
    distractors: [
      'Relational systems support ACID transactions only on a single-row scope; document stores guarantee ACID consistency across the entire database at once.',
      'Relational systems are practically limited to small datasets under one gigabyte; document stores are the only architectural option for any larger data volume.',
      'Relational systems use UTF-8 text encoding by default for all stored columns; document stores use a binary JSON format exclusively for any kind of data.',
    ],
  },
  {
    language: 'en',
    context:
      'Quicksort and heapsort are both comparison-based sorting algorithms with the same average-case time complexity, yet they exhibit notably different worst-case behavior and practical performance characteristics across input distributions.',
    stem:
      'Why does quicksort have O(n²) worst-case complexity while heapsort guarantees O(n log n) worst case on the same input array?',
    correct:
      'Quicksort partition can be maximally unbalanced for an already-sorted input, while heap operations always operate at logarithmic depth regardless of input order.',
    distractors: [
      'Quicksort uses comparisons between keys, while heapsort uses arithmetic operations that scale logarithmically by design of the heap data structure.',
      'Quicksort is implemented recursively, while heapsort is iterative, and recursion itself always adds an extra linear factor to the asymptotic complexity.',
      'Quicksort requires that all input values are unique to terminate, while heapsort handles duplicates without affecting its asymptotic upper bound on time.',
    ],
  },
];
