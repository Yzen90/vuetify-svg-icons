import { parse, Node } from 'acorn';
import { ancestor, simple } from 'acorn-walk';
import c from 'picocolors';

import type { ImportDeclaration /* , ImportExpression */ } from 'estree';

type MaybeImportDeclaration = Node & Pick<Partial<ImportDeclaration>, 'source'>;
type MaybeImportExpression = MaybeImportDeclaration; // Node & Pick<Partial<ImportExpression>, 'source'>
type Location = { start: number; end: number };

const getLocation = (ancestors: Node[]): Location | null => {
  for (const node of ancestors.reverse()) {
    if (node.type === 'VariableDeclaration') return { start: node.start, end: node.end };
  }

  return null;
};

export const stripImports = (code: string, showReplacements: boolean, iconPackage?: string, extractorPkg?: string) => {
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });

  const imports: Location[] = [];
  let packageFound = !extractorPkg;
  let iconPackageFound = !iconPackage;

  try {
    simple(ast, {
      ImportDeclaration({ start, end, source }: MaybeImportDeclaration) {
        if (!packageFound && source?.value === extractorPkg) {
          imports.push({ start, end });
          packageFound = true;
          if (iconPackageFound) throw null; // Stop search
        } else if (!iconPackageFound && source?.value === iconPackage) {
          imports.push({ start, end });
          iconPackageFound = true;
          if (packageFound) throw null; // Stop search
        }
      },
    });

    if (!packageFound || !iconPackageFound) {
      ancestor(ast, {
        ImportExpression({ source }: MaybeImportExpression, _, ancestors) {
          if (!packageFound && source?.value === extractorPkg) {
            const location = getLocation(ancestors);
            if (location) imports.push(location);
            packageFound = true;
            if (iconPackageFound) throw null; // Stop search
          } else if (!iconPackageFound && source?.value === iconPackage) {
            const location = getLocation(ancestors);
            if (location) imports.push(location);
            iconPackageFound = true;
            if (packageFound) throw null; // Stop search
          }
        },
      });
    }
  } catch {}

  if (imports.length > 0) {
    let stripped = '';
    let next = 0;
    for (const { start, end } of imports.sort((a, b) => a.start - b.start)) {
      stripped = stripped + code.slice(next, start);
      next = code.charAt(end) === '\n' ? end + 1 : end;
    }
    stripped = stripped + code.slice(next);

    if (showReplacements) {
      if (packageFound && extractorPkg) console.info(`  ${c.yellow(`- Removed import of \`${extractorPkg}\`.`)}`);
      if (iconPackageFound && iconPackage) console.info(`  ${c.yellow(`- Removed import of \`${iconPackage}\`.`)}`);
    }

    return stripped;
  }

  return code;
};

export const truncate = (text: string) => (text.length > 50 ? text.slice(0, 49) + '…' : text);

export const useReplacer = (
  showReplacements: boolean,
  extractor: Function,
  icons: Record<string, any>,
  matches?: Array<string>,
) => {
  const replacer = (original: string, fullID: string) => {
    const icon = fullID.split('.').pop()!;
    if (icon in icons) {
      matches?.push(icon);
      return `'${extractor(icons[icon]!)}'`;
    }
    return original;
  };

  if (showReplacements) {
    return (original: string, icon: string) => {
      const result = replacer(original, icon);
      if (result === original) console.info(` > ${icon} -> ${c.yellow('Not found, not replaced.')}`);
      else console.info(`  - ${icon} -> ${c.dim(truncate(result))}`);
      return result;
    };
  }

  return replacer;
};
