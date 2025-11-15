import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Lock, GitBranch } from "lucide-react";

// Hardcoded skill tree data
const skillTreeData = {
  name: 'Frontend Development',
  description: 'The foundation of modern web applications.',
  completed: true,
  children: [
    {
      name: 'HTML',
      description: 'Structure of web content.',
      completed: true,
      children: [
        { name: 'Basics', description: 'Tags and elements.', completed: true },
        { name: 'Forms', description: 'User input.', completed: true },
        { name: 'HTML5 Semantics', description: 'Modern structure.', completed: true },
      ],
    },
    {
      name: 'CSS',
      description: 'Styling web content.',
      completed: true,
      children: [
        { name: 'Selectors & Specificity', description: 'Targeting elements.', completed: true },
        { name: 'Flexbox', description: '1D layout model.', completed: true },
        { name: 'Grid', description: '2D layout model.', completed: false },
        { name: 'Animations', description: 'Dynamic effects.', completed: false },
      ],
    },
    {
      name: 'JavaScript',
      description: 'Making web pages interactive.',
      completed: false,
      children: [
        { name: 'ES6+ Features', description: 'Modern JS syntax.', completed: true },
        { name: 'DOM Manipulation', description: 'Interacting with HTML.', completed: false },
        { name: 'Async/Await', description: 'Handling async operations.', completed: false },
      ],
    },
    {
      name: 'React',
      description: 'A component-based UI library.',
      completed: false,
      children: [
        { name: 'Components & Props', description: 'Building blocks of UI.', completed: false },
        { name: 'State & Lifecycle', description: 'Managing component data.', completed: false },
        { name: 'Hooks', description: 'Using state and other React features.', completed: false },
      ],
    },
  ],
};

interface Skill {
  name: string;
  description: string;
  completed: boolean;
  children?: Skill[];
}

const SkillNode: React.FC<{ skill: Skill; level: number }> = ({ skill, level }) => {
  return (
    <Card className={`mb-4 ${skill.completed ? 'border-green-500' : 'border-gray-300'}`}>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            {skill.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-gray-400" />}
            {skill.name}
          </CardTitle>
          <CardDescription>{skill.description}</CardDescription>
        </div>
        <GitBranch className="w-6 h-6 text-gray-400" />
      </CardHeader>
      {skill.children && (
        <CardContent className="pl-10 pr-4 pb-4">
          {skill.children.map((child, index) => (
            <SkillNode key={index} skill={child} level={level + 1} />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

const SkillTree = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
       <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold">Your Skill Tree</h1>
            <p className="text-muted-foreground mt-2">This is your personalized learning path. Completed skills are marked in green.</p>
        </header>
        <SkillNode skill={skillTreeData} level={0} />
       </div>
    </div>
  );
};

export default SkillTree;
