import React from 'react';

/** Questions and answers, all open, in two columns on wide screens. */
const QuestionsList: React.FC<{ items: { question: string; answer: React.ReactNode }[] }> = ({ items }) => (
  <dl className="grid gap-8 md:grid-cols-2 md:gap-x-12">
    {items.map((item) => (
      <div key={item.question}>
        <dt className="font-semibold text-foreground mb-1.5">{item.question}</dt>
        <dd className="text-body">{item.answer}</dd>
      </div>
    ))}
  </dl>
);

export default QuestionsList;
