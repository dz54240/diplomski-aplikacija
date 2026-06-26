import type { ShotExample } from './types.js';

export const UNDERSTAND_EXAMPLES: ShotExample[] = [
  {
    language: 'hr',
    context:
      'Tijekom treniranja modela strojnog učenja, ponekad model postiže izrazito malu pogrešku na trening skupu, ali znatno veću na podacima koje nije vidio. Ovo se često događa kod modela s previše parametara.',
    stem: 'Što opisuje pojam "prenaučenost" (overfitting) modela strojnog učenja?',
    correct:
      'Model je naučio specifične šumove i karakteristike trening skupa umjesto generaliziranih obrazaca koji vrijede izvan skupa.',
    distractors: [
      'Model je primijenjen na previše različitih zadataka istovremeno bez prilagodbe parametara svakom od njih.',
      'Model konvergira presporo zbog premalog learning rate parametra postavljenog ispod razumne donje granice.',
      'Model koristi previše neuronskih slojeva za jednostavan zadatak i zato troši dodatne računske resurse.',
    ],
  },
  {
    language: 'hr',
    context:
      'Gradijentni spust je iterativna optimizacijska metoda koja postupno smanjuje funkciju gubitka pomicanjem parametara modela u suprotnom smjeru od smjera najvećeg rasta funkcije gubitka.',
    stem: 'Koja je uloga learning rate (η) parametra u algoritmu gradijentnog spusta?',
    correct: 'Određuje veličinu koraka kojim se parametri pomiču u svakoj iteraciji optimizacije.',
    distractors: [
      'Broji ukupan broj iteracija prije zaustavljanja optimizacije i prelaska na evaluaciju.',
      'Kontrolira udio podataka korištenih u jednom mini-batch-u tijekom jedne epohe treniranja.',
      'Postavlja prag ispod kojeg se vrijednost gubitka smatra konvergiranom prema globalnom minimumu.',
    ],
  },
  {
    language: 'hr',
    context:
      'Operacija JOIN u SQL-u kombinira retke iz dvije ili više tablica na temelju povezanog stupca. Postoje različite varijante koje se razlikuju po tome koji se retci uključuju kada nema podudaranja.',
    stem: 'Koja izjava najbolje opisuje razliku između INNER JOIN i LEFT JOIN u SQL-u?',
    correct:
      'INNER vraća samo retke s podudaranjem u objema tablicama; LEFT vraća sve retke iz lijeve plus NULL za neusklađene.',
    distractors: [
      'INNER vraća sve retke iz obiju tablica; LEFT vraća samo retke s podudaranjem u lijevoj tablici upita.',
      'INNER izvodi presjek stupaca dviju tablica; LEFT izvodi uniju stupaca i ne uvodi NULL vrijednosti u rezultat.',
      'INNER ne podržava NULL vrijednosti u stupcima; LEFT automatski zamjenjuje sve NULL vrijednosti nulom u izlazu.',
    ],
  },
  {
    language: 'hr',
    context:
      'Rekurzivne funkcije pozivaju same sebe s manjom verzijom problema dok ne dostignu osnovni slučaj koji se rješava izravno. Često se koriste za stabla, particije i podijeli-pa-vladaj algoritme.',
    stem: 'Što se događa ako rekurzivna funkcija nema valjano definiran osnovni slučaj?',
    correct:
      'Funkcija nastavlja pozivati samu sebe dok se ne potroši dostupni prostor poziva i ne dogodi prelijevanje stoga.',
    distractors: [
      'Funkcija vraća unaprijed definiranu nulu kao zadanu vrijednost jer ne može završiti rekurzivni lanac.',
      'Funkcija se automatski pretvara u iterativni oblik tijekom prevođenja optimizacijom kompajlera repa poziva.',
      'Funkcija pokreće asinkrono izvođenje na pozadinskoj dretvi da izbjegne blokiranje glavnog stoga programa.',
    ],
  },
  {
    language: 'en',
    context:
      'When training predictive models, total error can be decomposed into bias, variance, and irreducible noise. Different model choices and training regimes shift the balance between bias and variance.',
    stem: 'Which statement best explains the bias-variance tradeoff in supervised machine learning?',
    correct:
      'Simpler models tend to have high bias and low variance, while more complex models tend to have low bias and high variance.',
    distractors: [
      'Simpler models always have strictly lower total error than complex models on unseen test data, regardless of dataset.',
      'Bias measures the noise present in the training labels, while variance measures the noise in the held-out test labels.',
      'Increasing the training set size reduces bias of the model but always increases variance proportionally with sample size.',
    ],
  },
  {
    language: 'en',
    context:
      'Modern neural network training typically processes data in mini-batches rather than one example at a time or the full dataset at once. This choice affects both training speed and final model quality.',
    stem: 'Why are mini-batches commonly used instead of full-batch gradient descent in deep learning?',
    correct:
      'Mini-batches provide a noisy gradient estimate that fits in GPU memory and helps the optimizer escape shallow local minima.',
    distractors: [
      'Mini-batches produce a mathematically exact gradient that always converges faster than full-batch descent in practice.',
      'Mini-batches reduce the number of weight updates required per epoch by exactly a factor equal to the chosen batch size.',
      'Mini-batches automatically adjust the learning rate based on the gradient magnitude observed for each individual batch.',
    ],
  },
  {
    language: 'en',
    context:
      'Database normalization is a process of organizing relational schemas to reduce data redundancy and avoid update anomalies. The process follows a series of normal forms, each addressing specific problems.',
    stem: 'What is the primary purpose of normalizing a relational schema to third normal form (3NF)?',
    correct:
      'Eliminate transitive dependencies so that every non-key attribute depends only on the primary key of its table.',
    distractors: [
      'Compress the physical storage of tuples by removing repeated string values across multiple rows of the same table.',
      'Improve read query performance by precomputing common joins between frequently accessed tables ahead of time.',
      'Encrypt sensitive columns automatically to prevent unauthorized access to row-level data by application users.',
    ],
  },
  {
    language: 'en',
    context:
      'Cross-validation is a resampling technique used to evaluate how well a model will generalize to unseen data. K-fold variants partition the dataset and rotate which portion is held out for evaluation.',
    stem: 'What does k-fold cross-validation primarily protect against when evaluating a model?',
    correct: 'Overestimating model performance due to a particular lucky or unlucky train-test split of the data.',
    distractors: [
      'Training instability caused by exploding or vanishing gradients during backpropagation through deep network layers.',
      'Selection bias introduced when input features happen to be highly correlated with the target variable in the dataset.',
      'Memory exhaustion that occurs when the dataset is too large to fit into system RAM during training iterations.',
    ],
  },
];
