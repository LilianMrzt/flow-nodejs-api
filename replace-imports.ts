import { Project } from 'ts-morph'
import path from 'path'

// Ton alias config
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

for (const sourceFile of sourceFiles) {
    let changed = false

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const importPath = importDecl.getModuleSpecifierValue()

        if (importPath.startsWith('.')) {
            const absPath = path.resolve(path.dirname(sourceFile.getFilePath()), importPath)

            for (const [alias, targetPath] of Object.entries(aliasMap)) {
                const absTarget = path.resolve(targetPath)

                if (absPath.startsWith(absTarget)) {
                    const newPath = alias + absPath.slice(absTarget.length).replace(/\\/g, '/')
                    importDecl.setModuleSpecifier(newPath)
                    changed = true
                    break
                }
            }
        }
    }

    if (changed) {
        sourceFile.saveSync()
        console.log(`✅ Updated: ${sourceFile.getFilePath()}`)
    }
}
