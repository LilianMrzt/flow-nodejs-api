import { Project } from 'ts-morph'
import path from 'path'

// Alias map
const aliasMap: Record<string, string> = {
    '@src': './src',
    '@config': './src/config',
    '@entities': './src/entities',
    '@controllers': './src/controllers',
    '@services': './src/services',
    '@routes': './src/routes',
    '@dtos': './src/dtos',
    '@middleware': './src/middleware',
    '@utils': './src/utils',
    '@constants': './src/constants',
    '@emails': './src/emails',
    '@interfaces': './src/interfaces'
}

const project = new Project({
    tsConfigFilePath: 'tsconfig.json'
})

const sourceFiles = project.getSourceFiles('src/**/*.{ts,tsx}')

// Résolution absolue de chaque alias
const resolvedAliasMap = Object.entries(aliasMap)
    .map(([alias, relPath]) => {
        const absPath = path.resolve(relPath)
        return { alias, absPath }
    })
    // trie les alias du plus spécifique (long) au plus général
    .sort((a, b) => {
        return b.absPath.length - a.absPath.length
    })

for (const sourceFile of sourceFiles) {
    let changed = false

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const importPath = importDecl.getModuleSpecifierValue()

        // Ne modifie que les chemins relatifs
        if (importPath.startsWith('.')) {
            const absImportPath = path.resolve(path.dirname(sourceFile.getFilePath()), importPath)

            // Cherche le match le plus spécifique
            const match = resolvedAliasMap.find(({ absPath }) => {
                return absImportPath.startsWith(absPath)
            }
            )

            if (match) {
                const relativePart = absImportPath.slice(match.absPath.length).replace(/\\/g, '/')
                const newPath = match.alias + relativePart
                importDecl.setModuleSpecifier(newPath)
                changed = true
            }
        }
    }

    if (changed) {
        sourceFile.saveSync()
        console.log(`✅ Updated: ${sourceFile.getFilePath()}`)
    }
}
