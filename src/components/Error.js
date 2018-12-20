import React from "react";

// prettier-ignore
const Error = errors => (
  <pre>
    {errors.map(({ message }, i) => (
      <span className="text-red" key={i}>{message}</span>
    ))}
  </pre>
);

export default Error;
