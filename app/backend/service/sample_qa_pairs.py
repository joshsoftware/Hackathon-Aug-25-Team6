# Sample Question-Answer Pairs for Testing
# This can be used to test the QuestionAnalysisService

qa_pairs = [
    {
        "question_id": 1,
        "question": "Explain the difference between REST and GraphQL APIs.",
        "answer": "REST (Representational State Transfer) and GraphQL are two different approaches to building APIs. REST is an architectural style that uses standard HTTP methods (GET, POST, PUT, DELETE) and typically returns fixed data structures. Each endpoint in REST represents a specific resource or collection of resources. It's simple to implement and widely used, but can lead to over-fetching or under-fetching data.\n\nGraphQL, developed by Facebook, is a query language for APIs where clients can specify exactly what data they need. It typically uses a single endpoint where clients send queries describing the data they want. This solves the over-fetching/under-fetching problem of REST. GraphQL gives more control to the client, while REST gives more control to the server. GraphQL also provides a strongly-typed schema which serves as documentation and enables tooling for validation and autocomplete.",
    },
    {
        "question_id": 2,
        "question": "What are closures in JavaScript and why are they useful?",
        "answer": "A closure in JavaScript is when a function has access to its own scope, the outer function's scope, and the global scope, even after the outer function has finished executing. It's created when a function is defined within another function, and the inner function references variables from the outer function.\n\nClosures are useful for several reasons:\n1. Data privacy/encapsulation: They allow you to create private variables that can't be accessed directly from outside.\n2. Function factories: You can create functions that generate other functions with specific behaviors.\n3. Maintaining state: They help preserve values between function calls without using global variables.\n\nFor example:\n```javascript\nfunction counter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst increment = counter();\nconsole.log(increment()); // 1\nconsole.log(increment()); // 2\n```\n\nHere, the inner function maintains access to `count` even after `counter()` has finished executing.",
    },
]
