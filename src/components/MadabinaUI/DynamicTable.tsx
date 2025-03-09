import React from 'react';

const GenerateTable = ({ title, table }: { title: string; table: any }) => {
  return (
    <div className="p-6 rounded-lg">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border border-gray-300" colSpan={table[0].length}>
              {title}
            </th>
          </tr>
        </thead>
        <tbody>
          {table.map((row: any[], index: number) => (
            <tr key={index} className="hover:bg-white/40 transition-colors">
              {row.map((cell, index) => (
                <td key={index} className="p-3 border border-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DynamicComponent = ({ children, data }: { children: string; data: any }) => {
  // Extract the function call from the custom syntax
  const match = children.match(/^\${GenerateTable\((.*?)\)}/);
  if (!match) return null;

  // Evaluate the function call (safely)
  try {
    const config = JSON.parse(match[1].replace(/(\w+):/g, '"$1":')); // Convert to valid JSON
    return <GenerateTable {...config} />;
  } catch (error) {
    console.error('Error parsing dynamic component:', error);
    return null;
  }
};

export default DynamicComponent;