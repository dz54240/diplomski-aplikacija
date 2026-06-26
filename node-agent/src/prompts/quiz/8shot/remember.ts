import type { ShotExample } from './types.js';

export const REMEMBER_EXAMPLES: ShotExample[] = [
  {
    language: 'hr',
    context:
      'U području optimizacije modela strojnog učenja, SGD je jedan od najčešće korištenih algoritama jer omogućuje skaliranje na velike skupove podataka korištenjem nasumičnih mini-skupina umjesto cjelokupnog skupa za izračun gradijenta.',
    stem: 'Što označava akronim SGD u kontekstu optimizacije neuronskih mreža?',
    correct: 'Stochastic Gradient Descent.',
    distractors: [
      'Standard Gradient Distribution.',
      'Sequential Gradient Decay.',
      'Symbolic Gradient Derivation.',
    ],
  },
  {
    language: 'hr',
    context:
      'PCA je linearna metoda smanjenja dimenzionalnosti koja projektira podatke na ortogonalne osi maksimalne varijance. Često se koristi za vizualizaciju i prethodnu obradu prije treninga modela.',
    stem: 'Što označava akronim PCA u području smanjenja dimenzionalnosti?',
    correct: 'Principal Component Analysis.',
    distractors: [
      'Partial Correlation Approximation.',
      'Probabilistic Cluster Assignment.',
      'Polynomial Coefficient Adjustment.',
    ],
  },
  {
    language: 'hr',
    context:
      'U relacijskim bazama podataka, ACID svojstva osiguravaju pouzdano izvođenje transakcija čak i u slučaju kvara sustava ili istovremenih pristupa od više korisnika koji čitaju i pišu iste retke.',
    stem: 'Što stoji za slovo "I" u ACID svojstvima transakcija baze podataka?',
    correct: 'Izolacija (Isolation).',
    distractors: [
      'Integritet (Integrity).',
      'Identifikacija (Identification).',
      'Indeksacija (Indexing).',
    ],
  },
  {
    language: 'hr',
    context:
      'B-stabla su uravnotežene strukture podataka koje se koriste u sustavima baza podataka i datotekama indeksa zbog efikasnosti pretraživanja, umetanja i brisanja, gdje visina stabla raste sporo s brojem elemenata.',
    stem: 'Koja je tipična vremenska složenost pretrage u B-stablu s n ključeva?',
    correct: 'O(log n).',
    distractors: [
      'O(n).',
      'O(n log n).',
      'O(1).',
    ],
  },
  {
    language: 'en',
    context:
      'An MLP is the simplest feedforward neural network architecture, where each layer is fully connected to the next and nonlinear activation functions between layers enable learning of complex mappings from inputs to outputs.',
    stem: 'What does the acronym MLP stand for in neural network terminology?',
    correct: 'Multilayer Perceptron.',
    distractors: [
      'Maximum Likelihood Predictor.',
      'Modular Latent Projection.',
      'Marginal Loss Propagation.',
    ],
  },
  {
    language: 'en',
    context:
      'ReLU is the most widely used activation function in modern deep learning. It is computationally cheap and helps mitigate the vanishing gradient problem that plagued earlier networks using sigmoid or tanh activations.',
    stem: 'What does the ReLU activation function output for a negative input value x?',
    correct: 'Zero.',
    distractors: [
      'The input value x itself.',
      'Negative one.',
      'The absolute value of x.',
    ],
  },
  {
    language: 'en',
    context:
      'A cryptographic hash function maps inputs of arbitrary length to fixed-length outputs and forms the basis for digital signatures, data integrity checks, and password storage schemes used by modern web systems.',
    stem: 'Which of the following is a widely used cryptographic hash function family?',
    correct: 'SHA-256.',
    distractors: [
      'AES-256.',
      'RSA-256.',
      'DES-256.',
    ],
  },
  {
    language: 'en',
    context:
      'Binary search is a classic divide-and-conquer algorithm that operates on sorted arrays by repeatedly halving the search range based on the comparison between the target value and the middle element.',
    stem: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
    correct: 'O(log n).',
    distractors: [
      'O(n).',
      'O(n log n).',
      'O(sqrt(n)).',
    ],
  },
];
