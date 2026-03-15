const fs=require('fs'); 
let c=fs.readFileSync('src/components/ui/chart.tsx','utf8'); 
c=c.replace("  (\n    {\n      active,\n      payload,", "  (props: any, ref) => {\n    const {\n      active,\n      payload,");
c=c.replace("    },\n    ref,\n  ) => {", "    } = props;");
fs.writeFileSync('src/components/ui/chart.tsx',c,'utf8');
console.log('Fixed chart typescript type');
