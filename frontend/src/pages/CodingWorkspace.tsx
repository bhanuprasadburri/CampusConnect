import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import {
  AlertCircle, ArrowRight, CheckCircle2, Clock, Code2, FileText, Loader2,
  Maximize2, Minimize2, Moon, Play, RotateCcw, Sun
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { ApiResponse, CodeExecutionResult } from '../types';
import { monaco, MONACO_DARK_THEME, MONACO_LIGHT_THEME } from '../lib/monacoSetup';

/* ------------------------------------------------------------------ */
/* Practice problem database                                           */
/* ------------------------------------------------------------------ */

type CodingLanguage = 'Java' | 'Python' | 'C' | 'C++' | 'JavaScript';

const LANGUAGE_ORDER: CodingLanguage[] = ['Java', 'Python', 'C', 'C++', 'JavaScript'];

const MONACO_LANGUAGE: Record<CodingLanguage, string> = {
  Java: 'java',
  Python: 'python',
  C: 'c',
  'C++': 'cpp',
  JavaScript: 'javascript',
};

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium';
  statement: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  constraints: string;
  starters: Record<CodingLanguage, string>;
}

const PROBLEMS: CodingProblem[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    difficulty: 'Easy',
    statement: 'Write a program that prints "Hello, World!" to the console.',
    inputFormat: 'No input.',
    outputFormat: 'Exactly: Hello, World!',
    sampleInput: '',
    sampleOutput: 'Hello, World!',
    constraints: 'None.',
    starters: {
      Java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      Python: `print("Hello, World!")`,
      C: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      JavaScript: `console.log("Hello, World!");`,
    },
  },
  {
    id: 'add-two-numbers',
    title: 'Add Two Numbers',
    difficulty: 'Easy',
    statement: 'Write a program that reads two integers and prints their sum.',
    inputFormat: 'Two integers on one line, separated by a space.',
    outputFormat: 'The sum of the two integers.',
    sampleInput: '10 20',
    sampleOutput: '30',
    constraints: 'Values fit in a 32-bit signed integer.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
        sc.close();
    }
}`,
      Python: `a, b = map(int, input().split())
print(a + b)`,
      C: `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
      JavaScript: `const parts = require('fs').readFileSync(0, 'utf8').trim().split(' ');
const a = Number(parts[0]);
const b = Number(parts[1]);
console.log(a + b);`,
    },
  },
  {
    id: 'even-odd',
    title: 'Check Even or Odd',
    difficulty: 'Easy',
    statement: 'Write a program that reads an integer and prints whether it is even or odd.',
    inputFormat: 'A single integer.',
    outputFormat: 'Print "Even" if even, otherwise "Odd".',
    sampleInput: '7',
    sampleOutput: 'Odd',
    constraints: '32-bit signed integer range.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n % 2 == 0 ? "Even" : "Odd");
        sc.close();
    }
}`,
      Python: `n = int(input())
print("Even" if n % 2 == 0 else "Odd")`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%s\\n", n % 2 == 0 ? "Even" : "Odd");
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << (n % 2 == 0 ? "Even" : "Odd") << endl;
    return 0;
}`,
      JavaScript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());
console.log(n % 2 === 0 ? 'Even' : 'Odd');`,
    },
  },
  {
    id: 'largest-three',
    title: 'Find the Largest of Three Numbers',
    difficulty: 'Easy',
    statement: 'Write a program that reads three numbers and prints the largest of them.',
    inputFormat: 'Three integers on one line, separated by spaces.',
    outputFormat: 'The largest of the three numbers.',
    sampleInput: '12 7 23',
    sampleOutput: '23',
    constraints: '32-bit signed integer range.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        System.out.println(Math.max(a, Math.max(b, c)));
        sc.close();
    }
}`,
      Python: `a, b, c = map(int, input().split())
print(max(a, b, c))`,
      C: `#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int largest = a > b ? (a > c ? a : c) : (b > c ? b : c);
    printf("%d\\n", largest);
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << max(a, max(b, c)) << endl;
    return 0;
}`,
      JavaScript: `const parts = require('fs').readFileSync(0, 'utf8').trim().split(' ').map(Number);
console.log(Math.max(parts[0], parts[1], parts[2]));`,
    },
  },
  {
    id: 'reverse-string',
    title: 'Reverse a String',
    difficulty: 'Easy',
    statement: 'Write a program that reads a string and prints it in reverse.',
    inputFormat: 'A single line of text.',
    sampleInput: 'hello',
    outputFormat: 'The input line in reverse order.',
    sampleOutput: 'olleh',
    constraints: 'Line length up to 1000 characters.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(new StringBuilder(s).reverse().toString());
        sc.close();
    }
}`,
      Python: `s = input()
print(s[::-1])`,
      C: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[1001];
    if (fgets(s, sizeof s, stdin) != NULL) {
        s[strcspn(s, "\\n")] = '\\0';
        int len = strlen(s);
        for (int i = len - 1; i >= 0; i--) {
            putchar(s[i]);
        }
        putchar('\\n');
    }
    return 0;
}`,
      'C++': `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    reverse(s.begin(), s.end());
    cout << s << endl;
    return 0;
}`,
      JavaScript: `const s = require('fs').readFileSync(0, 'utf8').trim();
console.log(s.split('').reverse().join(''));`,
    },
  },
  {
    id: 'palindrome',
    title: 'Check Palindrome',
    difficulty: 'Easy',
    statement: 'Write a program that reads a string and checks if it is a palindrome.',
    inputFormat: 'A single word (case-sensitive).',
    outputFormat: 'Print "Yes" if it is a palindrome, otherwise "No".',
    sampleInput: 'racecar',
    sampleOutput: 'Yes',
    constraints: 'Length up to 100 characters.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String reversed = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(reversed) ? "Yes" : "No");
        sc.close();
    }
}`,
      Python: `s = input().strip()
print("Yes" if s == s[::-1] else "No")`,
      C: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[101];
    scanf("%100s", s);
    int len = strlen(s);
    int ok = 1;
    for (int i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            ok = 0;
            break;
        }
    }
    printf("%s\\n", ok ? "Yes" : "No");
    return 0;
}`,
      'C++': `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cin >> s;
    string reversed = s;
    reverse(reversed.begin(), reversed.end());
    cout << (s == reversed ? "Yes" : "No") << endl;
    return 0;
}`,
      JavaScript: `const s = require('fs').readFileSync(0, 'utf8').trim();
console.log(s === s.split('').reverse().join('') ? 'Yes' : 'No');`,
    },
  },
  {
    id: 'factorial',
    title: 'Calculate Factorial',
    difficulty: 'Easy',
    statement: 'Write a program that reads a non-negative integer and prints its factorial (n!).',
    inputFormat: 'A single integer n.',
    outputFormat: 'The value of n!.',
    sampleInput: '5',
    sampleOutput: '120',
    constraints: '0 <= n <= 20.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        System.out.println(result);
        sc.close();
    }
}`,
      Python: `n = int(input())
result = 1
for i in range(2, n + 1):
    result *= i
print(result)`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    printf("%lld\\n", result);
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    cout << result << endl;
    return 0;
}`,
      JavaScript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());
let result = 1;
for (let i = 2; i <= n; i++) {
    result *= i;
}
console.log(result);`,
    },
  },
  {
    id: 'multiplication',
    title: 'Generate Multiplication Table',
    difficulty: 'Easy',
    statement: 'Write a program that reads an integer n and prints its multiplication table from 1 to 10.',
    inputFormat: 'A single integer n.',
    outputFormat: 'Ten lines of the form: n x i = product',
    sampleInput: '5',
    sampleOutput: '5 x 1 = 5\n5 x 2 = 10\n...\n5 x 10 = 50',
    constraints: '1 <= n <= 100.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
        sc.close();
    }
}`,
      Python: `n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= 10; i++) {
        printf("%d x %d = %d\\n", n, i, n * i);
    }
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << endl;
    }
    return 0;
}`,
      JavaScript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());
for (let i = 1; i <= 10; i++) {
    console.log(n + ' x ' + i + ' = ' + (n * i));
}`,
    },
  },
  {
    id: 'prime',
    title: 'Check Prime Number',
    difficulty: 'Medium',
    statement: 'Write a program that reads an integer and checks whether it is prime.',
    inputFormat: 'A single integer n.',
    outputFormat: 'Print "Yes" if prime, otherwise "No".',
    sampleInput: '17',
    sampleOutput: 'Yes',
    constraints: '2 <= n <= 10000.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean isPrime = n >= 2;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        System.out.println(isPrime ? "Yes" : "No");
        sc.close();
    }
}`,
      Python: `n = int(input())
if n < 2:
    print("No")
else:
    is_prime = True
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    print("Yes" if is_prime else "No")`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int is_prime = n >= 2;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            is_prime = 0;
            break;
        }
    }
    printf("%s\\n", is_prime ? "Yes" : "No");
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    bool isPrime = n >= 2;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }
    cout << (isPrime ? "Yes" : "No") << endl;
    return 0;
}`,
      JavaScript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());
let isPrime = n >= 2;
for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
        isPrime = false;
        break;
    }
}
console.log(isPrime ? 'Yes' : 'No');`,
    },
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Series',
    difficulty: 'Easy',
    statement: 'Write a program that reads an integer n and prints the first n Fibonacci numbers.',
    inputFormat: 'A single integer n.',
    outputFormat: 'n space-separated Fibonacci numbers starting from 0.',
    sampleInput: '7',
    sampleOutput: '0 1 1 2 3 5 8',
    constraints: '1 <= n <= 50.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println();
        sc.close();
    }
}`,
      Python: `n = int(input())
a, b = 0, 1
out = []
for _ in range(n):
    out.append(str(a))
    a, b = b, a + b
print(' '.join(out))`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        printf("%d ", a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    printf("\\n");
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        int temp = a + b;
        a = b;
        b = temp;
    }
    cout << endl;
    return 0;
}`,
      JavaScript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());
let a = 0, b = 1;
const out = [];
for (let i = 0; i < n; i++) {
    out.push(String(a));
    const temp = a + b;
    a = b;
    b = temp;
}
console.log(out.join(' '));`,
    },
  },
  {
    id: 'sum-array',
    title: 'Sum of Array Elements',
    difficulty: 'Easy',
    statement: 'Write a program that reads an integer n followed by n integers and prints their sum.',
    inputFormat: 'First line: n. Second line: n integers separated by spaces.',
    outputFormat: 'The sum of the n integers.',
    sampleInput: '5\n1 2 3 4 5',
    sampleOutput: '15',
    constraints: '1 <= n <= 100; values fit in a 32-bit signed integer.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += sc.nextInt();
        }
        System.out.println(sum);
        sc.close();
    }
}`,
      Python: `n = int(input())
nums = list(map(int, input().split()))
print(sum(nums))`,
      C: `#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        sum += x;
    }
    printf("%d\\n", sum);
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n, sum = 0;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum += x;
    }
    cout << sum << endl;
    return 0;
}`,
      JavaScript: `const t = require('fs').readFileSync(0, 'utf8').split(' ').filter(function (x) {
    return x.length > 0;
}).map(Number);
const n = t[0];
let sum = 0;
for (let i = 1; i <= n; i++) {
    sum += t[i];
}
console.log(sum);`,
    },
  },
  {
    id: 'largest-array',
    title: 'Find the Largest Element in an Array',
    difficulty: 'Easy',
    statement: 'Write a program that reads an integer n followed by n integers and prints the largest of them.',
    inputFormat: 'First line: n. Second line: n integers separated by spaces.',
    outputFormat: 'The largest of the n integers.',
    sampleInput: '5\n1 9 3 7 4',
    sampleOutput: '9',
    constraints: '1 <= n <= 100; values fit in a 32-bit signed integer.',
    starters: {
      Java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int largest = sc.nextInt();
        for (int i = 1; i < n; i++) {
            int x = sc.nextInt();
            if (x > largest) {
                largest = x;
            }
        }
        System.out.println(largest);
        sc.close();
    }
}`,
      Python: `n = int(input())
nums = list(map(int, input().split()))
print(max(nums))`,
      C: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int largest;
    scanf("%d", &largest);
    for (int i = 1; i < n; i++) {
        int x;
        scanf("%d", &x);
        if (x > largest) {
            largest = x;
        }
    }
    printf("%d\\n", largest);
    return 0;
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int largest;
    cin >> largest;
    for (int i = 1; i < n; i++) {
        int x;
        cin >> x;
        if (x > largest) {
            largest = x;
        }
    }
    cout << largest << endl;
    return 0;
}`,
      JavaScript: `const t = require('fs').readFileSync(0, 'utf8').split(' ').filter(function (x) {
    return x.length > 0;
}).map(Number);
const n = t[0];
let largest = t[1];
for (let i = 2; i <= n; i++) {
    if (t[i] > largest) {
        largest = t[i];
    }
}
console.log(largest);`,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Monaco-powered practice workspace                                   */
/* ------------------------------------------------------------------ */

type RunPhase = 'idle' | 'running' | 'success' | 'error';

const FONT_SIZES = [12, 13, 14, 16, 18];

const CodingWorkspace: React.FC = () => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('hello-world');
  const [supportedLanguages, setSupportedLanguages] = useState<CodingLanguage[]>([]);
  const [languagesStatus, setLanguagesStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>('Java');
  const [fontSize, setFontSize] = useState<number>(14);
  const [editorTheme, setEditorTheme] = useState<string>(MONACO_DARK_THEME);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [stdin, setStdin] = useState<string>('');
  const [runPhase, setRunPhase] = useState<RunPhase>('idle');
  const [runResult, setRunResult] = useState<CodeExecutionResult | null>(null);
  const [requestError, setRequestError] = useState<string>('');
  const [editorHeight, setEditorHeight] = useState<number>(420);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Drag the divider to resize the editor panel (min 200px, max 900px).
  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = editorHeight;
    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(900, Math.max(200, startHeight + (moveEvent.clientY - startY)));
      setEditorHeight(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.dispatchEvent(new Event('resize')); // Monaco automaticLayout sync
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const problem = PROBLEMS.find((p) => p.id === selectedProblemId) ?? PROBLEMS[0];

  const applyStarter = useCallback((problemId: string, language: CodingLanguage) => {
    const target = PROBLEMS.find((p) => p.id === problemId) ?? PROBLEMS[0];
    const starter = target.starters[language] ?? '';
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, MONACO_LANGUAGE[language]);
      }
      editor.setValue(starter);
    }
  }, []);

  // Mount Monaco once.
  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return;
    }
    const editor = monaco.editor.create(containerRef.current, {
      value: PROBLEMS[0].starters.Java,
      language: MONACO_LANGUAGE.Java,
      theme: MONACO_DARK_THEME,
      fontSize: 14,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      renderWhitespace: 'selection',
    });
    editorRef.current = editor;
    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, []);

  // Ask the backend which languages this execution service can really run.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .getSupportedLanguages()
      .then((languages) => {
        if (cancelled) return;
        const supported = LANGUAGE_ORDER.filter((l) => languages.includes(l));
        if (supported.length === 0) {
          setLanguagesStatus('error');
          setRequestError('No execution languages are available right now. Please try again later.');
          return;
        }
        setSupportedLanguages(supported);
        setLanguagesStatus('ready');
        if (!supported.includes('Java')) {
          setSelectedLanguage(supported[0]);
          applyStarter('hello-world', supported[0]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLanguagesStatus('error');
        setRequestError('Could not load supported languages from the execution service.');
      });
    return () => {
      cancelled = true;
    };
  }, [applyStarter]);

  // Escape leaves the expanded editor view.
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  const handleLanguageChange = (language: CodingLanguage) => {
    setSelectedLanguage(language);
    applyStarter(problem.id, language);
    setRunPhase('idle');
    setRunResult(null);
    setRequestError('');
  };

  const handleProblemChange = (problemId: string) => {
    setSelectedProblemId(problemId);
    applyStarter(problemId, selectedLanguage);
    setRunPhase('idle');
    setRunResult(null);
    setRequestError('');
  };

  const handleReset = () => {
    applyStarter(problem.id, selectedLanguage);
    setStdin('');
    setRunPhase('idle');
    setRunResult(null);
    setRequestError('');
    editorRef.current?.focus();
  };

  const handleRun = async () => {
    if (runPhase === 'running') return;
    const source = editorRef.current?.getValue() ?? '';
    if (!source.trim()) {
      setRunPhase('error');
      setRunResult(null);
      setRequestError('Please write some code before running.');
      return;
    }
    setRunPhase('running');
    setRunResult(null);
    setRequestError('');
    try {
      const result = await apiClient.executeCode({
        sourceCode: source,
        programmingLanguage: selectedLanguage,
        standardInput: stdin,
      });
      setRunResult(result);
      setRunPhase('success');
    } catch (error) {
      const err = error as AxiosError<ApiResponse<unknown>>;
      const status = err.response?.status;
      const message = err.response?.data?.message;
      let friendly = 'Could not reach the execution service. Check your connection and try again.';
      if (status === 400) {
        friendly = message || 'The request was invalid. Check your code and language, then try again.';
      } else if (status === 401) {
        friendly = 'Your session has expired. Please sign in again.';
      } else if (status === 403) {
        friendly = 'You do not have permission to run code.';
      } else if (status === 429) {
        friendly = message || 'Too many runs in a short time. Please wait a moment and try again.';
      } else if (status && status >= 500) {
        friendly = 'The execution service hit an unexpected problem. Please try again shortly.';
      }
      setRunPhase('error');
      setRequestError(friendly);
    }
  };

  const hasCompileError = Boolean(runResult?.compilationError);
  const hasRuntimeError = Boolean(runResult?.runtimeError);
  const outputText = runResult?.output ?? '';

  return (
    <section className={`portal-card coding-workspace ${expanded ? 'cw-expanded' : ''}`}>
      <div className="cw-toolbar">
        <div className="cw-brand">
          <span className="section-icon"><Code2 /></span>
          <div>
            <h2>Practice Workspace</h2>
            <p>{problem.title} · {problem.difficulty}</p>
          </div>
        </div>
        <div className="cw-controls">
          <label className="cw-field">
            <span>Problem</span>
            <select value={selectedProblemId} onChange={(e) => handleProblemChange(e.target.value)}>
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <div className="cw-field">
            <span>Language</span>
            <div className="cw-pills" role="tablist" aria-label="Programming language">
              {languagesStatus === 'loading' && <small className="cw-muted">Loading…</small>}
              {languagesStatus === 'error' && <small className="cw-muted">Unavailable</small>}
              {supportedLanguages.map((language) => (
                <button
                  key={language}
                  type="button"
                  role="tab"
                  aria-selected={selectedLanguage === language}
                  className={`cw-pill ${selectedLanguage === language ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
          <label className="cw-field">
            <span>Font size</span>
            <select
              value={fontSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                setFontSize(size);
                editorRef.current?.updateOptions({ fontSize: size });
              }}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </label>
          <div className="cw-field">
            <span>Theme</span>
            <div className="cw-icon-group">
              <button
                type="button"
                className="cw-icon-btn"
                title={editorTheme === MONACO_DARK_THEME ? 'Switch to light theme' : 'Switch to dark theme'}
                aria-label={editorTheme === MONACO_DARK_THEME ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={() => {
                  const next = editorTheme === MONACO_DARK_THEME ? MONACO_LIGHT_THEME : MONACO_DARK_THEME;
                  setEditorTheme(next);
                  monaco.editor.setTheme(next);
                }}
              >
                {editorTheme === MONACO_DARK_THEME ? <Sun /> : <Moon />}
              </button>
              <button type="button" className="cw-icon-btn" title="Reset code to starter template" aria-label="Reset code to starter template" onClick={handleReset}>
                <RotateCcw />
              </button>
              <button
                type="button"
                className="cw-icon-btn"
                title={expanded ? 'Exit full screen (Esc)' : 'Expand editor'}
                aria-label={expanded ? 'Exit full screen' : 'Expand editor'}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? <Minimize2 /> : <Maximize2 />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cw-body">
        <div className="cw-left">
          <div className="cw-problem-desc">
            <h3>{problem.title} <span className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span></h3>
            <p className="cw-statement">{problem.statement}</p>
            <div className="cw-meta">
              <div>
                <strong>Input format</strong>
                <p>{problem.inputFormat}</p>
              </div>
              <div>
                <strong>Output format</strong>
                <p>{problem.outputFormat}</p>
              </div>
            </div>
            <div className="cw-meta">
              <div>
                <strong>Sample input</strong>
                <pre>{problem.sampleInput || '(none)'}</pre>
              </div>
              <div>
                <strong>Sample output</strong>
                <pre>{problem.sampleOutput}</pre>
              </div>
            </div>
            <p className="cw-constraints"><strong>Constraints:</strong> {problem.constraints}</p>
          </div>
          <div className="cw-stdin">
            <div className="cw-stdin-head">
              <FileText />
              <strong>Standard input</strong>
              <small>Optional — fed to your program when you run it.</small>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={problem.sampleInput ? `e.g.\n${problem.sampleInput}` : 'This problem needs no input.'}
              spellCheck={false}
              disabled={runPhase === 'running'}
            />
          </div>
        </div>

        <div className="cw-right">
          <div className="cw-editor-shell" style={{ height: editorHeight }}>
            <div className="cw-editor" ref={containerRef} />
          </div>
          <div
            className="cw-resize-handle"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize editor panel"
            title="Drag to resize the editor"
            onPointerDown={handleResizeStart}
          />
          <div className="cw-runbar">
            <button type="button" className="solid-button cw-run-btn" onClick={handleRun} disabled={runPhase === 'running' || languagesStatus !== 'ready'}>
              {runPhase === 'running' ? <><Loader2 className="cw-spin" /> Running…</> : <><Play /> Run Code</>}
            </button>
            <button type="button" className="outline-button" title="Automatic grading of submissions is not available yet." disabled>
              Submit Solution (unavailable)
            </button>
            <div className="cw-run-meta">
              {runResult?.executionTime && runPhase === 'success' && (
                <span className="cw-chip"><Clock /> {runResult.executionTime}</span>
              )}
              {runPhase === 'success' && !hasCompileError && !hasRuntimeError && (
                <span className="cw-chip cw-chip-ok"><CheckCircle2 /> Ran successfully</span>
              )}
              {hasCompileError && <span className="cw-chip cw-chip-bad"><AlertCircle /> Compile error</span>}
              {hasRuntimeError && !hasCompileError && <span className="cw-chip cw-chip-bad"><AlertCircle /> Runtime error</span>}
            </div>
          </div>
          <div className="cw-output" aria-live="polite">
            {runPhase === 'running' && (
              <div className="cw-out-note"><Loader2 className="cw-spin" /> Compiling and running your code…</div>
            )}
            {runPhase === 'idle' && !requestError && (
              <div className="cw-out-note cw-muted">Output from your program will appear here. Press Run Code to execute it on the server.</div>
            )}
            {requestError && (
              <div className="cw-out-error"><AlertCircle /><pre>{requestError}</pre></div>
            )}
            {hasCompileError && (
              <div className="cw-out-error"><AlertCircle /><div><strong>Compilation error</strong><pre>{runResult?.compilationError}</pre></div></div>
            )}
            {hasRuntimeError && !hasCompileError && (
              <div className="cw-out-error"><AlertCircle /><div><strong>Runtime error</strong><pre>{runResult?.runtimeError}</pre></div></div>
            )}
            {runPhase === 'success' && !hasCompileError && outputText && (
              <div className="cw-out-block"><strong>Output</strong><pre>{outputText}</pre></div>
            )}
            {runPhase === 'success' && !hasCompileError && !hasRuntimeError && !outputText && (
              <div className="cw-out-block cw-muted">The program finished successfully and produced no output.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Standalone workspace page (/coding/editor)                          */
/* ------------------------------------------------------------------ */

export const CodingWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="portal-page entity-page coding-subpage">
      <button className="back-link" onClick={() => navigate('/coding')}>
        <ArrowRight className="back-arrow" /> Back to Coding Practice
      </button>
      <header className="portal-hero">
        <div className="portal-hero-icon"><Code2 /></div>
        <div>
          <span className="portal-breadcrumb">Coding Practice　›　Coding Workspace</span>
          <h1>Coding Workspace</h1>
          <p>Pick a problem, write your solution in the Monaco editor, and run it on the server — real execution with live output, error reporting, and timing.</p>
        </div>
      </header>
      <CodingWorkspace />
    </div>
  );
};
